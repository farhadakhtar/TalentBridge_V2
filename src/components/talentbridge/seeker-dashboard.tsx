'use client'

/**
 * TalentBridge_V2 — job seeker dashboard (BLUE/CYAN identity).
 * Greeting with gradient name + live date, CountUp stat tiles, glass profile
 * card, gradient date-block events, recruiters with gradient Message CTAs.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  CalendarDays,
  Clock,
  Mail,
  MessageSquare,
  MessageSquareText,
  UserRound,
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
import { eventPill, initials, roleTheme, statusBadge, todayISO, toastError } from './tb-utils'
import { CountUp, MotionCard, SectionHeading, StaggerGroup, StaggerItem } from './tb-motion'

interface Props {
  user: SafeUser
  onOpenConversation: (conversationId: string) => void
}

export function SeekerDashboard({ user, onOpenConversation }: Props) {
  const guard = useAuthGuard()
  const queryClient = useQueryClient()
  const theme = roleTheme.blue

  const eventsQuery = useQuery({ queryKey: ['events'], queryFn: api.getEvents })
  const recruitersQuery = useQuery({
    queryKey: ['users', 'recruiter'],
    queryFn: () => api.getUsers('recruiter'),
  })
  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: api.getConversations,
    refetchInterval: 6000,
  })

  useAuthErrorEffect(eventsQuery.error)
  useAuthErrorEffect(recruitersQuery.error)
  useAuthErrorEffect(conversationsQuery.error)

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
  const unreadDms = (conversationsQuery.data?.conversations ?? []).reduce((sum, c) => sum + c.unreadCount, 0)
  const recruiters = recruitersQuery.data?.users ?? []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user.name.split(' ')[0]

  const stats = [
    {
      label: 'Upcoming events',
      value: eventsQuery.isLoading ? 0 : upcoming.length,
      icon: CalendarDays,
      hint: 'Interviews & calls ahead',
    },
    {
      label: 'Unread DMs',
      value: conversationsQuery.isLoading ? 0 : unreadDms,
      icon: MessageSquareText,
      hint: 'Waiting for a reply',
    },
    {
      label: 'Recruiters',
      value: recruitersQuery.isLoading ? 0 : recruiters.length,
      icon: Users,
      hint: 'Ready to chat',
    },
  ]

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <SectionHeading
        accent="blue"
        eyebrow="Dashboard"
        title={
          <>
            {greeting},{' '}
            <span className={theme.gradientText}>{firstName}</span>
          </>
        }
        description={format(new Date(), 'EEEE, d MMMM yyyy')}
      />

      {/* Stat tiles */}
      <StaggerGroup className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <MotionCard accent="blue" className="flex items-center gap-3.5 p-4">
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
              <span aria-hidden className={cn('h-1 w-8 shrink-0 rounded-full bg-gradient-to-r', theme.gradient, 'opacity-60')} />
            </MotionCard>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Profile */}
        <MotionCard accent="blue" className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">My profile</p>
          <div className="mt-4 flex items-center gap-3">
            <span className={cn('shrink-0 rounded-full bg-gradient-to-br p-[2.5px]', theme.avatarRing)}>
              <Avatar className="size-14">
                <AvatarFallback className="rounded-full bg-[oklch(0.19_0.022_275)] text-lg font-bold text-white">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.title ?? '—'}</p>
              {user.status && (
                <Badge variant="outline" className={cn('mt-1.5', statusBadge[user.status] ?? '')}>
                  {user.status}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="mt-3 flex items-start gap-2">
            <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="flex flex-wrap gap-1.5">
              {user.skills.length > 0 ? (
                user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-xs text-foreground transition-colors duration-200 hover:border-blue-400/40 hover:text-blue-300"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No skills listed</span>
              )}
            </div>
          </div>
        </MotionCard>

        {/* Upcoming events */}
        <MotionCard accent="blue" className="p-5 lg:col-span-2" delay={0.05}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Upcoming events
            </p>
            <CalendarDays className={cn('size-4', theme.text)} aria-hidden />
          </div>
          <div className="mt-4">
            {eventsQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg bg-white/5" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
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
                    className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 transition-all duration-200 hover:translate-x-1 hover:border-white/12 hover:bg-white/[0.05]"
                  >
                    <div
                      className={cn(
                        'flex size-11 shrink-0 flex-col items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br',
                        theme.gradientSoft,
                      )}
                    >
                      <span className="text-sm font-bold leading-none text-foreground">{e.date.slice(8, 10)}</span>
                      <span className="text-[9px] uppercase leading-tight text-muted-foreground">{e.time}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" aria-hidden /> {e.time}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn(eventPill(e.type, 'blue'), 'border')}>
                      {e.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </MotionCard>
      </div>

      {/* Recruiters */}
      <MotionCard accent="blue" className="p-5" delay={0.1}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recruiters</p>
          <MessageSquare className={cn('size-4', theme.text)} aria-hidden />
        </div>
        <div className="mt-4">
          {recruitersQuery.isLoading ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg bg-white/5" />
              ))}
            </div>
          ) : recruiters.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No recruiters available</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {recruiters.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:border-emerald-400/25 hover:bg-white/[0.05]"
                >
                  <span className={cn('shrink-0 rounded-full bg-gradient-to-br p-[2px]', 'from-emerald-400 to-teal-300')}>
                    <Avatar className="size-9">
                      <AvatarFallback className="rounded-full bg-[oklch(0.19_0.022_275)] text-xs font-semibold text-white">
                        {initials(r.name)}
                      </AvatarFallback>
                    </Avatar>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.title ?? 'Recruiter'}</p>
                  </div>
                  <Button
                    size="sm"
                    disabled={openConversation.isPending}
                    onClick={() => openConversation.mutate(r.id)}
                    className={cn('h-8 gap-1.5 px-3 text-xs active:scale-[0.97]', theme.solid)}
                  >
                    <MessageSquare className="size-3.5" aria-hidden /> Message
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </MotionCard>
    </div>
  )
}
