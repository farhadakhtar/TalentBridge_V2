'use client'

/**
 * TalentBridge_V2 — Command Center "Overview" tab (violet accent).
 * Hiring funnel with animated gradient bars + shimmer, DM-activity bars,
 * glass meeting timeline, dark candidate pipeline table.
 */
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { CalendarDays, Inbox, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { CompanyStats } from '@/lib/types'
import { initials, statusBadge } from './tb-utils'
import { CountUp, MotionCard } from './tb-motion'

const EASE = [0.16, 1, 0.3, 1] as const

function Funnel({ stats }: { stats: CompanyStats }) {
  const { applied, interview, offer } = stats.funnel
  const rows = [
    { label: 'Applied', value: applied, pct: 100, bar: 'from-blue-500 to-cyan-400', dot: 'bg-blue-400' },
    {
      label: 'Interview',
      value: interview,
      pct: applied ? (interview / applied) * 100 : 0,
      bar: 'from-violet-500 to-fuchsia-400',
      dot: 'bg-violet-400',
    },
    {
      label: 'Offer',
      value: offer,
      pct: applied ? (offer / applied) * 100 : 0,
      bar: 'from-emerald-500 to-teal-400',
      dot: 'bg-emerald-400',
    },
  ]
  return (
    <MotionCard accent="violet" interactive={false} className="p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Users className="size-3.5 text-violet-300" aria-hidden /> Hiring funnel
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">Candidate progression across stages</p>
      <div className="mt-5 space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span className={cn('size-2 rounded-full', r.dot)} aria-hidden />
                {r.label}
              </span>
              <span className="text-sm font-semibold text-foreground">
                <CountUp value={r.value} />
              </span>
            </div>
            <div className="relative h-6 w-full overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.04]">
              <motion.div
                className={cn('relative h-full overflow-hidden rounded-lg bg-gradient-to-r', r.bar)}
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.max(r.pct, r.value > 0 ? 12 : 0)}%` }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 64, damping: 18 }}
              >
                <span aria-hidden className="animate-shimmer absolute inset-0 rounded-lg" />
                {r.value > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-white">
                    {Math.round(r.pct)}%
                  </span>
                )}
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </MotionCard>
  )
}

function DmActivity({ stats }: { stats: CompanyStats }) {
  const max = Math.max(1, ...stats.dmStats.map((d) => d.total))
  return (
    <MotionCard accent="violet" interactive={false} className="p-5" delay={0.05}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Inbox className="size-3.5 text-violet-300" aria-hidden /> DM activity per recruiter
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">Total messages sent + received</p>
      <div className="mt-5 space-y-4">
        {stats.dmStats.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">No DM activity yet</p>
        )}
        {stats.dmStats.map((d) => (
          <div key={d.recruiterId}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{d.recruiterName}</span>
              <span className="text-sm font-semibold text-foreground">
                <CountUp value={d.total} />
              </span>
            </div>
            <div className="relative h-6 w-full overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.04]">
              <motion.div
                className="relative h-full overflow-hidden rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-400"
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.max((d.total / max) * 100, d.total > 0 ? 10 : 0)}%` }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 64, damping: 18 }}
              >
                <span aria-hidden className="animate-shimmer absolute inset-0 rounded-lg" />
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </MotionCard>
  )
}

function UpcomingMeetings({ stats }: { stats: CompanyStats }) {
  return (
    <MotionCard accent="violet" interactive={false} className="p-5" delay={0.1}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <CalendarDays className="size-3.5 text-violet-300" aria-hidden /> Upcoming meetings
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">Next events across the company</p>
      <div className="mt-4">
        {stats.upcomingMeetings.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No events yet</p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {stats.upcomingMeetings.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 transition-colors duration-200 hover:bg-white/[0.05]"
              >
                {/* date orb */}
                <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-full border border-violet-400/25 bg-gradient-to-br from-violet-500/20 to-fuchsia-400/10">
                  <span className="text-xs font-bold leading-none text-foreground">
                    {format(parseISO(e.date), 'dd')}
                  </span>
                  <span className="text-[8px] font-semibold uppercase leading-tight text-violet-300">
                    {format(parseISO(e.date), 'MMM')}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.time} · {e.creatorName} → {e.targetUserName}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 border-violet-400/25 bg-violet-500/15 text-[10px] text-violet-300"
                >
                  {e.type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </MotionCard>
  )
}

function Pipeline({ stats }: { stats: CompanyStats }) {
  return (
    <MotionCard accent="violet" interactive={false} className="p-5" delay={0.15}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Candidate pipeline
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">All applicants with their latest activity</p>
      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/8 hover:bg-transparent">
              <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300/80">
                Name
              </TableHead>
              <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300/80">
                Title
              </TableHead>
              <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300/80">
                Status
              </TableHead>
              <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300/80">
                Upcoming event
              </TableHead>
              <TableHead className="h-9 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300/80">
                Unread DMs
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.pipeline.map((row) => (
              <TableRow
                key={row.user.id}
                className="border-white/[0.06] transition-colors duration-200 hover:bg-white/[0.04]"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-300 p-[1.5px]">
                      <Avatar className="size-7">
                        <AvatarFallback className="rounded-full bg-[oklch(0.19_0.022_275)] text-[10px] font-semibold text-white">
                          {initials(row.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </span>
                    <span className="font-medium">{row.user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.user.title ?? '—'}</TableCell>
                <TableCell>
                  {row.user.status && (
                    <Badge variant="outline" className={statusBadge[row.user.status] ?? ''}>
                      {row.user.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.upcomingEvent
                    ? `${row.upcomingEvent.title} · ${format(parseISO(row.upcomingEvent.date), 'dd MMM')}`
                    : '—'}
                </TableCell>
                <TableCell className="text-right">
                  {row.unreadDmCount > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 px-1.5 text-[10px] font-bold text-white shadow-md shadow-violet-500/30">
                      {row.unreadDmCount}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MotionCard>
  )
}

export function CompanyOverviewTab({ stats }: { stats: CompanyStats }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Funnel stats={stats} />
        <DmActivity stats={stats} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <UpcomingMeetings stats={stats} />
        <Pipeline stats={stats} />
      </div>
    </div>
  )
}
