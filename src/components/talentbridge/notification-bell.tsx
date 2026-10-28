'use client'

/**
 * TalentBridge_V2 — topbar notification bell (job seekers & recruiters).
 * Polls /api/notifications every 3.5s; rows navigate to the DM or the event.
 * Dark glass-strong popover, ping dot on unread, staggered row entrance.
 */
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bell, CalendarDays, CheckCheck, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { api } from '@/lib/api-client'
import type { NotificationDTO } from '@/lib/types'
import { useAuthGuard } from './auth-context'
import { cn } from '@/lib/utils'
import { timeAgo, toastError, type Accent } from './tb-utils'
import { fadeUp, stagger } from './tb-motion'

interface Props {
  accent: Accent
  onOpenConversation: (conversationId: string) => void
  onOpenEvent: (eventId: string) => void
}

function NotificationRow({
  n,
  onClick,
}: {
  n: NotificationDTO
  onClick: (n: NotificationDTO) => void
}) {
  const isDm = n.type === 'dm'
  return (
    <motion.button
      type="button"
      variants={fadeUp}
      onClick={() => onClick(n)}
      className={cn(
        'group relative flex w-full items-start gap-2.5 overflow-hidden rounded-lg px-3 py-2.5 text-left transition-colors duration-200',
        n.read ? 'bg-transparent hover:bg-white/[0.05]' : 'bg-white/[0.04] hover:bg-white/[0.08]',
      )}
    >
      {/* unread accent edge */}
      {!n.read && (
        <span
          aria-hidden
          className={cn(
            'absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-full bg-gradient-to-b',
            isDm ? 'from-blue-400 to-cyan-300' : 'from-emerald-400 to-teal-300',
          )}
        />
      )}
      <span
        className={cn(
          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 group-hover:scale-105',
          isDm
            ? 'border-blue-400/25 bg-blue-500/15'
            : 'border-emerald-400/25 bg-emerald-500/15',
        )}
      >
        {isDm ? (
          <Mail className="size-3.5 text-blue-300" aria-hidden />
        ) : (
          <CalendarDays className="size-3.5 text-emerald-300" aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-xs leading-snug',
            n.read ? 'text-muted-foreground' : 'font-semibold text-foreground',
          )}
        >
          {n.message}
        </span>
        <span className="mt-0.5 block text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
      </span>
      {!n.read && (
        <span
          aria-hidden
          className={cn(
            'mt-1.5 size-2 shrink-0 animate-pulse rounded-full',
            isDm ? 'bg-blue-400' : 'bg-emerald-400',
          )}
        />
      )}
    </motion.button>
  )
}

export function NotificationBell({ accent, onOpenConversation, onOpenEvent }: Props) {
  const guard = useAuthGuard()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [justMarked, setJustMarked] = useState(false)

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.getNotifications,
    refetchInterval: 3500,
  })

  const markRead = useMutation({
    mutationFn: api.markNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setJustMarked(true)
    },
    onError: (err: Error) => {
      guard(err)
      if (!(err instanceof Error && err.message.includes('401'))) toastError(err.message)
    },
  })

  // Brief success tick after marking everything read.
  useEffect(() => {
    if (!justMarked) return
    const t = setTimeout(() => setJustMarked(false), 1600)
    return () => clearTimeout(t)
  }, [justMarked])

  const notifications = data?.notifications ?? []
  const unread = data?.unreadCount ?? 0
  const dms = notifications.filter((n) => n.type === 'dm')
  const events = notifications.filter((n) => n.type === 'event')

  // Majority unread type decides the ping tone; a tie reads amber.
  const unreadDms = dms.filter((n) => !n.read).length
  const unreadEvents = events.filter((n) => !n.read).length
  const tone = unreadDms === unreadEvents ? 'amber' : unreadDms > unreadEvents ? 'blue' : 'emerald'

  function handleClick(n: NotificationDTO) {
    if (!n.read) markRead.mutate({ ids: [n.id] })
    if (n.type === 'dm') onOpenConversation(n.refId)
    else onOpenEvent(n.refId)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground active:scale-90"
          aria-label={`Notifications (${unread} unread)`}
        >
          <Bell className="size-5" aria-hidden />
          {unread > 0 && (
            <>
              <span
                aria-hidden
                className="animate-pulse-ring absolute -right-0.5 -top-0.5 size-4 rounded-full"
                style={{
                  ['--pulse-color' as string]:
                    tone === 'blue'
                      ? 'oklch(0.62 0.19 262 / 0.55)'
                      : tone === 'emerald'
                        ? 'oklch(0.7 0.15 162 / 0.55)'
                        : 'oklch(0.78 0.15 80 / 0.55)',
                }}
              />
              <span
                aria-hidden
                className={cn(
                  'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r px-1 text-[10px] font-bold text-white',
                  tone === 'blue'
                    ? 'from-blue-500 to-cyan-400'
                    : tone === 'emerald'
                      ? 'from-emerald-500 to-teal-400'
                      : 'from-amber-500 to-orange-400',
                )}
              >
                {unread > 9 ? '9+' : unread}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="glass-strong w-80 rounded-xl border-white/10 p-0"
      >
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
          <p className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-300 bg-clip-text text-sm font-semibold text-transparent">
            Notifications
          </p>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 gap-1 px-2 text-xs text-muted-foreground underline-offset-2 hover:bg-white/5 hover:text-foreground hover:underline',
              justMarked && 'text-emerald-300',
            )}
            disabled={markRead.isPending || unread === 0}
            onClick={() => markRead.mutate({ all: true })}
          >
            {justMarked ? (
              <>
                <CheckCheck className="size-3.5" aria-hidden /> All read
              </>
            ) : (
              <>
                <CheckCheck className="size-3.5" aria-hidden /> Mark all read
              </>
            )}
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="flex size-10 items-center justify-center rounded-full border border-white/8 bg-white/[0.04]">
                <CheckCheck className="size-4 text-emerald-300" aria-hidden />
              </span>
              <p className="text-sm text-muted-foreground">You&apos;re all caught up</p>
            </div>
          ) : (
            <>
              {dms.length > 0 && (
                <>
                  <p className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <Mail className="size-3 text-blue-300" aria-hidden /> Messages
                  </p>
                  <motion.div
                    className="space-y-1"
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                  >
                    {dms.map((n) => (
                      <NotificationRow key={n.id} n={n} onClick={handleClick} />
                    ))}
                  </motion.div>
                </>
              )}
              {events.length > 0 && (
                <>
                  <p className="flex items-center gap-1.5 px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <CalendarDays className="size-3 text-emerald-300" aria-hidden /> Calendar
                  </p>
                  <motion.div
                    className="space-y-1"
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                  >
                    {events.map((n) => (
                      <NotificationRow key={n.id} n={n} onClick={handleClick} />
                    ))}
                  </motion.div>
                </>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
