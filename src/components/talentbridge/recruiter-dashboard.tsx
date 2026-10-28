'use client'

/**
 * TalentBridge_V2 — recruiter dashboard (EMERALD/TEAL identity).
 * Greeting + CountUp stats, applicant board of hover-lift cards, schedule
 * list with target chips. Message = glass CTA, Schedule = gradient + shine.
 */
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  CalendarDays,
  CalendarPlus,
  Clock,
  Mail,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api-client'
import type { SafeUser } from '@/lib/types'
import { useAuthGuard, useAuthErrorEffect } from './auth-context'
import { CreateEventDialog } from './create-event-dialog'
import { eventPill, initials, roleTheme, statusBadge, todayISO, toastError } from './tb-utils'
import { CountUp, MotionCard, SectionHeading, StaggerGroup, StaggerItem } from './tb-motion'

interface Props {
  user: SafeUser
  onOpenConversation: (conversationId: string) => void
}

export function RecruiterDashboard({ user, onOpenConversation }: Props) {
  const guard = useAuthGuard()
  const queryClient = useQueryClient()
  const [createFor, setCreateFor] = useState<string | undefined>(undefined)
  const [createOpen, setCreateOpen] = useState(false)
  const theme = roleTheme.emerald

  const seekersQuery = useQuery({
    queryKey: ['users', 'job_seeker'],
    queryFn: () => api.getUsers('job_seeker'),
  })
  const eventsQuery = useQuery({ queryKey: ['events'], queryFn: api.getEvents })

  useAuthErrorEffect(seekersQuery.error)
  useAuthErrorEffect(eventsQuery.error)

  const openConversation = useMutation({
    mutationFn: api.openConversation,
    onSuccess: ({ conversation }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      onOpenConversation(conversation.id)
    },
    onError: (err: Error) => {
      guard(err)
      toastError(err.message)
    },
  })

  const today = todayISO()
  const upcoming = (eventsQuery.data?.events ?? [])
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const seekers = seekersQuery.data?.users ?? []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user.name.split(' ')[0]

  const thisMonth = (eventsQuery.data?.events ?? []).filter(
    (e) => e.date.slice(0, 7) === today.slice(0, 7),
  ).length

  const stats = [
    {
      label: 'Candidates',
      value: seekersQuery.isLoading ? 0 : seekers.length,
      icon: Users,
      hint: 'On your applicant board',
    },
    {
      label: 'Upcoming events',
      value: eventsQuery.isLoading ? 0 : upcoming.length,
      icon: CalendarDays,
      hint: 'Interviews & calls ahead',
    },
    {
      label: `Events in ${format(new Date(), 'MMMM')}`,
      value: eventsQuery.isLoading ? 0 : thisMonth,
      icon: Clock,
      hint: 'Scheduled this month',
    },
  ]

  return (
    <div className="space-y-5">
      <SectionHeading
        accent="emerald"
        eyebrow="Dashboard"
        title={
          <>
            {greeting}, <span className={theme.gradientText}>{firstName}</span>
          </>
        }
        description={format(new Date(), 'EEEE, d MMMM yyyy')}
      />

      {/* Stat tiles */}
      <StaggerGroup className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <MotionCard accent="emerald" className="flex items-center gap-3.5 p-4">
              <span
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br shadow-lg',
                  theme.gradientSoft,
                  theme.text,
                )}
              >
                <s.icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  <CountUp value={s.value} />
                </p>
                <p className="truncate text-xs font-medium text-muted-foreground">{s.label}</p>
              </div>
              <span
                aria-hidden
                className={cn('h-1 w-8 shrink-0 rounded-full bg-gradient-to-r opacity-60', theme.gradient)}
              />
            </MotionCard>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Applicant board */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Applicant board
          </p>
          <Users className={cn('size-4', theme.text)} aria-hidden />
        </div>
        {seekersQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl bg-white/5" />
            ))}
          </div>
        ) : (
          <StaggerGroup className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {seekers.map((s) => (
              <StaggerItem key={s.id}>
                <MotionCard accent="emerald" className="flex h-full flex-col">
                  <div className="flex-1 space-y-3 p-4">
                    <div className="flex items-center gap-3">
                      <span className={cn('shrink-0 rounded-full bg-gradient-to-br p-[2px]', theme.avatarRing)}>
                        <Avatar className="size-11">
                          <AvatarFallback className="rounded-full bg-[oklch(0.19_0.022_275)] text-sm font-bold text-white">
                            {initials(s.name)}
                          </AvatarFallback>
                        </Avatar>
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold tracking-tight">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.title ?? '—'}</p>
                      </div>
                    </div>
                    {s.status && (
                      <Badge variant="outline" className={statusBadge[s.status] ?? ''}>
                        {s.status}
                      </Badge>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {s.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[10px] text-foreground/70 transition-colors duration-200 hover:border-emerald-400/40 hover:text-emerald-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {s.skills.length > 3 && (
                        <span className="rounded-full border border-white/8 px-2 py-0.5 text-[10px] text-muted-foreground">
                          +{s.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-white/8 p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.97]"
                      disabled={openConversation.isPending}
                      onClick={() => openConversation.mutate(s.id)}
                    >
                      <Mail className="size-3.5" aria-hidden /> Message
                    </Button>
                    <Button
                      size="sm"
                      className={cn('shine flex-1 gap-1.5 active:scale-[0.97]', theme.solid)}
                      onClick={() => {
                        setCreateFor(s.id)
                        setCreateOpen(true)
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        <CalendarPlus className="size-3.5" aria-hidden /> Schedule
                      </span>
                    </Button>
                  </div>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>

      {/* Your schedule */}
      <MotionCard accent="emerald" className="p-5" delay={0.08}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Your schedule
          </p>
          <CalendarDays className={cn('size-4', theme.text)} aria-hidden />
        </div>
        <div className="mt-4">
          {eventsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg bg-white/5" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-full border border-white/8 bg-white/[0.04]">
                <CalendarDays className="size-4 text-muted-foreground/60" aria-hidden />
              </span>
              <p className="text-sm text-muted-foreground">No events yet</p>
            </div>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {upcoming.slice(0, 4).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 transition-all duration-200 hover:translate-x-1 hover:border-white/12 hover:bg-white/[0.05]"
                >
                  <div
                    className={cn(
                      'flex size-11 shrink-0 flex-col items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br',
                      theme.gradientSoft,
                    )}
                  >
                    <span className="text-sm font-bold leading-none">{e.date.slice(8, 10)}</span>
                    <span className="text-[9px] uppercase leading-tight text-muted-foreground">
                      {e.date.slice(5, 7)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" aria-hidden /> {e.time} · with{' '}
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                        {e.targetUserName}
                      </span>
                    </p>
                  </div>
                  <Badge variant="outline" className={cn(eventPill(e.type, 'emerald'), 'border')}>
                    {e.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </MotionCard>

      <CreateEventDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultTargetId={createFor}
      />
    </div>
  )
}
