'use client'

/**
 * TalentBridge_V2 — Company "Command Center" (violet/fuchsia identity).
 * Read-only dashboards: Overview, Cyber Security, Engineer, CEO.
 * Dark mission-control styling with LIVE polling indicator and glass tabs.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Eye, Gauge } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api-client'
import type { SafeUser } from '@/lib/types'
import { useAuthErrorEffect } from './auth-context'
import { roleTheme } from './tb-utils'
import { LiveDot } from './tb-motion'
import { CompanyCeoTab } from './company-ceo-tab'
import { CompanyCyberTab } from './company-cyber-tab'
import { CompanyEngineerTab } from './company-engineer-tab'
import { CompanyOverviewTab } from './company-overview-tab'

interface Props {
  user: SafeUser
}

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'cyber', label: 'Cyber Security' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'ceo', label: 'CEO' },
] as const

type TabValue = (typeof TABS)[number]['value']

export function CompanyDashboard({ user }: Props) {
  const [tab, setTab] = useState<TabValue>('overview')
  const theme = roleTheme.violet

  const statsQuery = useQuery({
    queryKey: ['company-stats'],
    queryFn: api.getCompanyStats,
    refetchInterval: 5000,
  })
  const auditQuery = useQuery({
    queryKey: ['audit-logs'],
    queryFn: api.getAuditLogs,
    refetchInterval: 5000,
  })

  useAuthErrorEffect(statsQuery.error)
  useAuthErrorEffect(auditQuery.error)

  const stats = statsQuery.data
  const logs = auditQuery.data?.logs ?? []

  if (!stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72 rounded-lg bg-white/5" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl bg-white/5" />
          <Skeleton className="h-64 rounded-xl bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="space-y-4">
      {/* Sticky mission-control sub-header */}
      <div className="sticky top-0 z-20 -mx-1 rounded-xl border border-white/8 bg-[oklch(0.15_0.022_275/85%)] px-4 py-2.5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <LiveDot tone="violet" />
            <span className={cn('font-semibold tracking-wide', theme.navActiveText)}>LIVE · polling</span>
            <span className="text-muted-foreground/60">· 5s</span>
            <span className="mx-1 hidden text-white/15 sm:inline">|</span>
            <span className="hidden sm:inline">
              Viewing as <span className="font-medium text-foreground">{user.name}</span> · {user.title}
            </span>
          </p>
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300">
            <Eye className="size-3" aria-hidden /> Read-only observer
          </span>
        </div>
      </div>

      <TabsList className="glass h-10 w-fit flex-wrap justify-start gap-1 rounded-xl bg-white/[0.03] p-1">
        {TABS.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className={cn(
              'relative rounded-lg px-3.5 py-1.5 text-sm transition-colors duration-200',
              'data-[state=active]:border-white/10 data-[state=active]:bg-white/[0.06] data-[state=active]:text-violet-300 data-[state=active]:shadow-none',
              'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground',
            )}
          >
            {t.label}
            {tab === t.value && (
              <motion.span
                layoutId="tb-tab-underline"
                className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              />
            )}
          </TabsTrigger>
        ))}
        <span className="ml-1 hidden items-center gap-1.5 pr-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/50 sm:flex">
          <Gauge className="size-3" aria-hidden /> Command
        </span>
      </TabsList>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <TabsContent value="overview" className="mt-0">
          <CompanyOverviewTab stats={stats} />
        </TabsContent>

        <TabsContent value="cyber" className="mt-0">
          <CompanyCyberTab logs={logs} />
        </TabsContent>

        <TabsContent value="engineer" className="mt-0">
          <CompanyEngineerTab stats={stats} lastUpdated={statsQuery.dataUpdatedAt} />
        </TabsContent>

        <TabsContent value="ceo" className="mt-0">
          <CompanyCeoTab kpis={stats.kpis} />
        </TabsContent>
      </motion.div>
    </Tabs>
  )
}
