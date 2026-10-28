'use client'

/**
 * TalentBridge_V2 — Command Center "Engineer" tab (Dev Menon).
 * API health (emerald LiveDot), database status (violet LiveDot + latency)
 * and six live CountUp record tiles with icon glows.
 */
import { format } from 'date-fns'
import {
  Activity,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Database,
  Mail,
  MessagesSquare,
  Server,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompanyStats } from '@/lib/types'
import { CountUp, LiveDot, MotionCard } from './tb-motion'

const COLLECTIONS = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'jobs', label: 'Jobs', icon: Briefcase },
  { key: 'applications', label: 'Applications', icon: ClipboardList },
  { key: 'conversations', label: 'Conversations', icon: MessagesSquare },
  { key: 'messages', label: 'Messages', icon: Mail },
  { key: 'calendarEvents', label: 'Calendar events', icon: CalendarDays },
  { key: 'notifications', label: 'Notifications', icon: Activity },
  { key: 'auditLogs', label: 'Audit logs', icon: Database },
] as const

export function CompanyEngineerTab({
  stats,
  lastUpdated,
}: {
  stats: CompanyStats
  lastUpdated: number
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* API status */}
        <MotionCard accent="violet" interactive={false} className="p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Server className="size-3.5 text-violet-300" aria-hidden /> API status
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">Next.js route handlers</p>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LiveDot tone="emerald" />
              <span className="text-sm font-semibold text-emerald-300">OK — responding</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated ? format(new Date(lastUpdated), 'HH:mm:ss') : '—'}
            </span>
          </div>
        </MotionCard>

        {/* Database */}
        <MotionCard accent="violet" interactive={false} className="p-5" delay={0.05}>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Database className="size-3.5 text-violet-300" aria-hidden /> Database
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">SQLite via Prisma ORM</p>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LiveDot tone={stats.dbConnected ? 'violet' : 'rose'} />
              <span
                className={cn(
                  'text-sm font-semibold',
                  stats.dbConnected ? 'text-violet-300' : 'text-red-300',
                )}
              >
                {stats.dbConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Latency <CountUp value={stats.dbLatencyMs} duration={0.8} /> ms
            </span>
          </div>
        </MotionCard>
      </div>

      {/* Record counts */}
      <MotionCard accent="violet" interactive={false} className="p-5" delay={0.1}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Record counts
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">Live totals across every collection</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {COLLECTIONS.map((c) => (
            <div
              key={c.key}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center transition-all duration-200 hover:border-violet-400/25 hover:bg-white/[0.06] hover:shadow-[0_0_24px_-8px] hover:shadow-violet-500/40"
            >
              <span className="mx-auto flex size-8 items-center justify-center rounded-lg border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-400/10 transition-transform duration-200 group-hover:scale-105">
                <c.icon className="size-4 text-violet-300" aria-hidden />
              </span>
              <p className="mt-2 text-xl font-bold tabular-nums text-foreground">
                <CountUp value={stats.collectionCounts[c.key]} />
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>
      </MotionCard>
    </div>
  )
}
