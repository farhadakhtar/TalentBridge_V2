'use client'

/**
 * TalentBridge_V2 — Command Center "CEO" tab (Meera Nair).
 * Four headline KPI glass cards with CountUp, gradient icon tiles and a
 * faint decorative radial glow.
 */
import { CalendarDays, MessagesSquare, Trophy, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KpiData } from '@/lib/types'
import { MotionCard } from './tb-motion'

export function CompanyCeoTab({ kpis }: { kpis: KpiData }) {
  const numeric = [
    { label: 'Total applicants', value: kpis.totalApplicants, icon: Users, hint: 'Job seekers in the pipeline' },
    { label: 'Events this month', value: kpis.eventsThisMonth, icon: CalendarDays, hint: 'Interviews, calls & meetings' },
    { label: 'DMs exchanged', value: kpis.dmsExchanged, icon: MessagesSquare, hint: 'All-time direct messages' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {numeric.map((c, i) => (
        <MotionCard key={c.label} accent="violet" className="overflow-hidden p-5" delay={i * 0.05}>
          {/* decorative radial glow */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-gradient-to-br from-violet-500/25 to-fuchsia-400/10 blur-2xl"
          />
          <p className="relative flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300/80">
            {c.label}
            <span className="flex size-8 items-center justify-center rounded-lg border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-400/10 shadow-lg shadow-violet-500/20">
              <c.icon className="size-4 text-violet-300" aria-hidden />
            </span>
          </p>
          <p className="relative mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {c.value.toLocaleString('en-US')}
          </p>
          <p className="relative mt-1 text-xs text-muted-foreground">{c.hint}</p>
        </MotionCard>
      ))}

      <MotionCard accent="violet" className="overflow-hidden p-5" delay={0.15}>
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-gradient-to-br from-amber-500/20 to-fuchsia-400/10 blur-2xl"
        />
        <p className="relative flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300/80">
          Most active recruiter
          <span className="flex size-8 items-center justify-center rounded-lg border border-amber-400/20 bg-gradient-to-br from-amber-500/20 to-fuchsia-400/10 shadow-lg shadow-amber-500/20">
            <Trophy className="size-4 text-amber-300" aria-hidden />
          </span>
        </p>
        <p
          className={cn('relative mt-2 truncate text-lg font-bold tracking-tight text-foreground')}
          title={kpis.mostActiveRecruiter}
        >
          {kpis.mostActiveRecruiter}
        </p>
        <p className="relative mt-1 text-xs text-muted-foreground">By messages sent</p>
      </MotionCard>
    </div>
  )
}
