'use client'

/**
 * TalentBridge_V2 — "My Calendar" section (job seeker & recruiter).
 * Owns the events query, the details dialog and the recruiter create dialog.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api-client'
import type { EventDTO, SafeUser } from '@/lib/types'
import { useAuthErrorEffect } from './auth-context'
import { CreateEventDialog } from './create-event-dialog'
import { EventDetailsDialog } from './event-details-dialog'
import { MonthCalendar } from './month-calendar'
import { roleTheme, type Accent } from './tb-utils'

interface Props {
  user: SafeUser
  accent: Accent
  /** Open the details dialog for this event (set by the notification bell). */
  openEventId: string | null
  onEventDialogClosed: () => void
}

export function CalendarView({ user, accent, openEventId, onEventDialogClosed }: Props) {
  const [selected, setSelected] = useState<EventDTO | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['events'],
    queryFn: api.getEvents,
  })
  useAuthErrorEffect(error)

  const events = data?.events ?? []
  const theme = roleTheme[accent]

  // The bell requested a specific event.
  const requested = openEventId ? (events.find((e) => e.id === openEventId) ?? null) : null

  return (
    <div className="space-y-4">
      <MonthCalendar
        events={events}
        accent={accent}
        highlightUserId={user.role === 'job_seeker' ? user.id : undefined}
        onSelectEvent={setSelected}
        headerAction={
          user.role === 'recruiter' ? (
            <Button
              size="sm"
              className={`shine h-8 gap-1.5 active:scale-[0.97] ${theme.solid}`}
              onClick={() => setCreateOpen(true)}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <CalendarPlus className="size-4" aria-hidden /> Create Event
              </span>
            </Button>
          ) : undefined
        }
      />

      {isLoading && <Skeleton className="h-24 w-full rounded-xl bg-white/5" />}
      {isError && (
        <p className="glass-destructive rounded-xl p-4 text-sm text-red-300">
          Failed to load events: {error instanceof Error ? error.message : 'unknown error'}
        </p>
      )}

      <EventDetailsDialog
        event={selected ?? requested}
        open={Boolean(selected ?? requested)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null)
            onEventDialogClosed()
          }
        }}
        accent={accent}
      />

      {user.role === 'recruiter' && (
        <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </div>
  )
}
