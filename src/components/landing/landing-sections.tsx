'use client'

/**
 * TalentBridge_V2 — landing page sections.
 * Three role worlds (with live mini-UI previews), an interactive product
 * tour inside a fake browser window, feature grid, the demo loop and the
 * seeded demo-account directory. Pure presentation — zero API calls.
 */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  Check,
  Database,
  Flag,
  KeyRound,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Radar,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { initials, roleTheme, statusBadge, type Accent } from '@/components/talentbridge/tb-utils'
import {
  CountUp,
  EASE,
  LiveDot,
  MotionCard,
  spring,
} from '@/components/talentbridge/tb-motion'
import {
  DrawLine,
  GradientText,
  IconTile,
  LandHeading,
  Parallax,
  Reveal,
  TiltCard,
} from './landing-bits'

/* ================================================================== */
/* 1 · THREE WORLDS — role cards with live mini-UI previews            */
/* ================================================================== */

const FUNNEL = [
  { label: 'Applied', value: 4, width: '100%', bar: 'from-blue-400 to-cyan-300' },
  { label: 'Interview', value: 2, width: '50%', bar: 'from-violet-400 to-fuchsia-300' },
  { label: 'Offer', value: 1, width: '25%', bar: 'from-emerald-400 to-teal-300' },
]

function FunnelMini() {
  return (
    <div className="space-y-2.5" aria-hidden>
      {FUNNEL.map((f, i) => (
        <div key={f.label}>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">{f.label}</span>
            <span className="font-bold tabular-nums text-foreground">{f.value}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className={cn('relative h-full rounded-full bg-gradient-to-r', f.bar)}
              initial={{ width: 0 }}
              whileInView={{ width: f.width }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.15 }}
            >
              {i === 0 && <span className="animate-shimmer absolute inset-0 rounded-full" />}
            </motion.div>
          </div>
        </div>
      ))}
      <p className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
        <LiveDot tone="violet" /> Live · 5s polling
      </p>
    </div>
  )
}

function SeekerMini() {
  return (
    <div className="mt-auto space-y-2.5 pt-6" aria-hidden>
      <div className="flex gap-2.5">
        <div className="glass flex-1 rounded-lg px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Unread DMs</p>
          <p className="text-lg font-bold text-blue-300">
            <CountUp value={4} />
          </p>
        </div>
        <div className="glass flex-1 rounded-lg px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Upcoming</p>
          <p className="text-lg font-bold text-emerald-300">
            <CountUp value={2} />
          </p>
        </div>
      </div>
      <div className="glass flex items-center gap-3 rounded-lg px-3 py-2.5">
        <span className="flex flex-col items-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 px-2 py-1 text-white shadow-md shadow-blue-500/30">
          <span className="text-[9px] font-bold leading-none">+7d</span>
          <span className="mt-0.5 text-[8px] leading-none opacity-80">10:30</span>
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-xs font-medium text-foreground">
            Interview — Frontend Role
          </span>
          <span className="block text-[10px] text-muted-foreground">
            Scheduled by Nikhil Verma
          </span>
        </span>
        <Flag className="size-3.5 shrink-0 text-amber-400" fill="currentColor" />
      </div>
    </div>
  )
}

function RecruiterMini() {
  const rows = [
    { name: 'Aarav Sharma', status: 'Interview', skills: 'React · TypeScript' },
    { name: 'Priya Patel', status: 'Applied', skills: 'SQL · Python' },
  ]
  return (
    <div className="mt-auto space-y-2 pt-6" aria-hidden>
      {rows.map((r) => (
        <div key={r.name} className="glass flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-400 text-[9px] font-bold text-white">
            {initials(r.name)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-xs font-medium text-foreground">{r.name}</span>
            <span className="block truncate text-[10px] text-muted-foreground">{r.skills}</span>
          </span>
          <span
            className={cn(
              'rounded-full border px-1.5 py-0.5 text-[9px] font-medium',
              statusBadge[r.status],
            )}
          >
            {r.status}
          </span>
        </div>
      ))}
      <div className="flex gap-2 pt-0.5">
        <span className="glass flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
          <MessageSquare className="size-3" /> Message
        </span>
        <span className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-1.5 text-[10px] font-semibold text-white shadow-md shadow-emerald-500/30">
          <CalendarDays className="size-3" /> Schedule
        </span>
      </div>
    </div>
  )
}

const WORLDS: {
  id: string
  num: string
  accent: Accent
  icon: LucideIcon
  name: string
  tagline: string
  points: string[]
  mini: () => React.ReactNode
}[] = [
  {
    id: 'seeker',
    num: '01',
    accent: 'blue',
    icon: UserRound,
    name: 'Job Seeker',
    tagline: 'Your entire search, organized and alive.',
    points: [
      'Live DM inbox with every recruiter',
      'A calendar that flags events meant for you',
      'One bell for messages + interview invites',
      'Skills, status tracking and quick stats',
    ],
    mini: SeekerMini,
  },
  {
    id: 'recruiter',
    num: '02',
    accent: 'emerald',
    icon: UsersRound,
    name: 'Recruiter',
    tagline: 'Move fast on great people.',
    points: [
      'Applicant board with statuses & skills',
      'Schedule interviews in three clicks',
      'DMs that reach candidates instantly',
      'Every action fires a notification',
    ],
    mini: RecruiterMini,
  },
  {
    id: 'company',
    num: '03',
    accent: 'violet',
    icon: Radar,
    name: 'Company',
    tagline: 'The mission-control view.',
    points: [
      'Live hiring funnel — applied → offer',
      'DM activity per recruiter',
      'Login audit trail & security checks',
      'API, database and CEO KPI dashboards',
    ],
    mini: FunnelMini,
  },
]

export function WorldsSection() {
  return (
    <section
      id="roles"
      aria-label="The three role worlds"
      className="relative mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-20 sm:px-6 sm:py-24"
    >
      <LandHeading
        eyebrow="Three worlds · one bridge"
        accent="blue"
        title={
          <>
            Built for every seat at the <GradientText accent="emerald">hiring table</GradientText>.
          </>
        }
        description="Every demo account belongs to one of three worlds. Each world gets its own accent, its own dashboard and its own superpowers — all sharing one bridge."
      />
      {/* Scroll-drifting glow behind the card row */}
      <Parallax speed={56} className="pointer-events-none absolute inset-x-0 top-1/3 -z-10">
        <div
          aria-hidden
          className="mx-auto size-72 rounded-full bg-gradient-to-br from-blue-500/12 via-violet-500/12 to-emerald-500/12 blur-3xl"
        />
      </Parallax>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {WORLDS.map((w, i) => {
          const theme = roleTheme[w.accent]
          const dirs: ('left' | 'up' | 'right')[] = ['left', 'up', 'right']
          return (
            <Reveal key={w.id} dir={dirs[i % 3]} delay={i * 0.12} className="h-full">
              <TiltCard className="h-full">
                <MotionCard accent={w.accent} className="flex h-full flex-col p-6 sm:p-7">
                  <div
                    aria-hidden
                    className={cn(
                      'pointer-events-none absolute -right-14 -top-14 size-44 rounded-full bg-gradient-to-br opacity-20 blur-3xl',
                      theme.gradient,
                    )}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <IconTile
                      icon={w.icon}
                      gradient={theme.gradient}
                      glow="shadow-lg"
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="rounded-md border border-white/8 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-muted-foreground">
                      {w.num} / {w.id.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-foreground">
                    {w.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{w.tagline}</p>
                  <ul className="mt-5 space-y-2.5">
                    {w.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-foreground/85">
                        <Check className={cn('mt-0.5 size-4 shrink-0', theme.text)} aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <w.mini />
                </MotionCard>
              </TiltCard>
            </Reveal>
          )
        })}
      </div>
      {/* Self-drawing connector under the three worlds */}
      <DrawLine
        d="M 8 10 C 120 54, 280 54, 392 10"
        viewBox="0 0 400 64"
        width={2}
        className="mx-auto mt-10 h-12 w-full max-w-md opacity-70"
      >
        <defs>
          <linearGradient id="tb-connector" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="0.5" stopColor="#a78bfa" stopOpacity="0.7" />
            <stop offset="1" stopColor="#34d399" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </DrawLine>
    </section>
  )
}

/* ================================================================== */
/* 2 · PRODUCT TOUR — fake browser with interactive tabbed mockups     */
/* ================================================================== */

type TourTab = 'seeker' | 'recruiter' | 'company'
type CompanySub = 'overview' | 'cyber' | 'engineer' | 'ceo'

const TOUR_TABS: {
  id: TourTab
  label: string
  icon: LucideIcon
  gradient: string
  text: string
}[] = [
  { id: 'seeker', label: 'Seeker', icon: UserRound, gradient: 'from-blue-400 to-cyan-300', text: 'text-blue-300' },
  { id: 'recruiter', label: 'Recruiter', icon: UsersRound, gradient: 'from-emerald-400 to-teal-300', text: 'text-emerald-300' },
  { id: 'company', label: 'Company', icon: Radar, gradient: 'from-violet-400 to-fuchsia-300', text: 'text-violet-300' },
]

function StatTile({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('glass rounded-xl px-3 py-2.5', className)}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-lg font-bold tabular-nums text-foreground">{children}</div>
    </div>
  )
}

function SeekerMock() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] text-muted-foreground">Signed in as aarav@mail.com</p>
        <p className="mt-0.5 text-lg font-bold text-foreground">
          Good evening, <GradientText accent="blue">Aarav</GradientText>
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile label="Unread DMs">
          <CountUp value={4} />
        </StatTile>
        <StatTile label="Upcoming">
          <CountUp value={2} />
        </StatTile>
        <StatTile label="Status" className="text-sm">
          <span className="text-blue-300">Interview</span>
        </StatTile>
      </div>
      <div className="glass flex items-center gap-3 rounded-xl px-3.5 py-3">
        <span className="flex flex-col items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 px-2.5 py-1.5 text-white shadow-md shadow-blue-500/30">
          <span className="text-[9px] font-bold leading-none">+7 days</span>
          <span className="mt-0.5 text-[8px] leading-none opacity-80">10:30</span>
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-medium text-foreground">
            Interview — Frontend Role
          </span>
          <span className="block text-[11px] text-muted-foreground">
            Panel: Nikhil + Lead Engineer · video call
          </span>
        </span>
        <Flag className="size-4 shrink-0 text-amber-400" fill="currentColor" />
      </div>
      <div className="glass flex items-center justify-between gap-3 rounded-xl px-3.5 py-3">
        <span className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 text-[9px] font-bold text-white">
            NV
          </span>
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Nikhil Verma</span> · Talent Lead
          </span>
        </span>
        <span className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-1.5 text-[10px] font-semibold text-white shadow-md shadow-blue-500/30">
          <MessageSquare className="size-3" /> Open chat
        </span>
      </div>
    </div>
  )
}

function RecruiterMock() {
  const cards = [
    { name: 'Aarav Sharma', title: 'Frontend Developer', status: 'Interview', skills: ['React', 'TypeScript'] },
    { name: 'Priya Patel', title: 'Data Analyst', status: 'Applied', skills: ['SQL', 'Python'] },
  ]
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-bold text-foreground">
          Applicant <GradientText accent="emerald">board</GradientText>
        </p>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <LiveDot tone="emerald" /> 4 candidates · live
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.name} className="glass rounded-xl p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 text-[9px] font-bold text-white">
                  {initials(c.name)}
                </span>
                <span className="leading-tight">
                  <span className="block text-xs font-semibold text-foreground">{c.name}</span>
                  <span className="block text-[10px] text-muted-foreground">{c.title}</span>
                </span>
              </span>
              <span
                className={cn(
                  'rounded-full border px-1.5 py-0.5 text-[9px] font-medium',
                  statusBadge[c.status],
                )}
              >
                {c.status}
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {c.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-white/8 bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <span className="glass flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-medium text-muted-foreground">
                <MessageSquare className="size-3" /> Message
              </span>
              <span className="shine relative flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 py-1.5 text-[10px] font-semibold text-white shadow-md shadow-emerald-500/30">
                <span className="relative z-10 flex items-center gap-1.5">
                  <CalendarDays className="size-3" /> Schedule
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Scheduling an event drops a <Flag className="inline size-3 text-amber-400" aria-hidden />{' '}
        flag on the candidate&apos;s calendar and pings their bell instantly.
      </p>
    </div>
  )
}

function CompanyOverviewMini() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="glass rounded-xl p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300">
          Hiring funnel
        </p>
        <div className="mt-3">
          <FunnelMini />
        </div>
      </div>
      <div className="glass rounded-xl p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300">
          DM activity
        </p>
        <div className="mt-3 space-y-2.5" aria-hidden>
          {[
            { name: 'Nikhil Verma', value: 10, width: '100%' },
            { name: 'Ananya Iyer', value: 4, width: '40%' },
          ].map((r) => (
            <div key={r.name}>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">{r.name}</span>
                <span className="font-bold tabular-nums text-foreground">{r.value}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-300"
                  initial={{ width: 0 }}
                  whileInView={{ width: r.width }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CompanyCyberMini() {
  const logs = [
    { email: 'ceo@mail.com', when: '26h ago' },
    { email: 'recruiter1@mail.com', when: '5h ago' },
    { email: 'aarav@mail.com', when: '3h ago' },
  ]
  return (
    <div className="space-y-2.5">
      {logs.map((l) => (
        <div
          key={l.email}
          className="glass flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <ShieldCheck className="size-3.5 shrink-0 text-emerald-400" aria-hidden />
            <span className="truncate font-mono text-[11px] text-foreground">{l.email}</span>
          </span>
          <span className="shrink-0 text-[10px] text-muted-foreground">login · {l.when}</span>
        </div>
      ))}
      <p className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
        <LiveDot tone="emerald" /> Every login is written to an immutable audit trail.
      </p>
    </div>
  )
}

function CompanyEngineerMini() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="glass flex items-center gap-2.5 rounded-xl px-3.5 py-3">
          <LiveDot tone="emerald" />
          <span className="leading-tight">
            <span className="block text-xs font-semibold text-foreground">API · OK</span>
            <span className="block font-mono text-[10px] text-muted-foreground">9 routes · 200</span>
          </span>
        </div>
        <div className="glass flex items-center gap-2.5 rounded-xl px-3.5 py-3">
          <LiveDot tone="violet" />
          <span className="leading-tight">
            <span className="block text-xs font-semibold text-foreground">SQLite · Connected</span>
            <span className="block font-mono text-[10px] text-muted-foreground">Prisma · 1 ms</span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile label="Users">
          <CountUp value={9} />
        </StatTile>
        <StatTile label="Messages">
          <CountUp value={14} />
        </StatTile>
        <StatTile label="Events">
          <CountUp value={5} />
        </StatTile>
      </div>
    </div>
  )
}

function CompanyCeoMini() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      <StatTile label="Applicants">
        <CountUp value={4} />
      </StatTile>
      <StatTile label="Events">
        <CountUp value={5} />
      </StatTile>
      <StatTile label="DMs sent">
        <CountUp value={14} />
      </StatTile>
      <StatTile label="Top recruiter" className="text-xs">
        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-transparent">
          Nikhil V.
        </span>
      </StatTile>
    </div>
  )
}

const COMPANY_SUBS: { id: CompanySub; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'cyber', label: 'Cyber' },
  { id: 'engineer', label: 'Engineer' },
  { id: 'ceo', label: 'CEO' },
]

function CompanyMock() {
  const [sub, setSub] = useState<CompanySub>('overview')
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-bold text-foreground">
          Command <GradientText accent="violet">Center</GradientText>
        </p>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <LiveDot tone="violet" /> Read-only observer
        </span>
      </div>
      <div
        role="tablist"
        aria-label="Command center areas"
        className="flex gap-1 rounded-xl border border-white/8 bg-white/[0.03] p-1"
      >
        {COMPANY_SUBS.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={sub === s.id}
            onClick={() => setSub(s.id)}
            className={cn(
              'relative flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors',
              sub === s.id ? 'text-violet-200' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {sub === s.id && (
              <motion.span
                layoutId="tour-subtab"
                className="absolute inset-0 rounded-lg border border-violet-400/25 bg-violet-500/15"
                transition={spring}
              />
            )}
            <span className="relative z-10">{s.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sub}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {sub === 'overview' && <CompanyOverviewMini />}
          {sub === 'cyber' && <CompanyCyberMini />}
          {sub === 'engineer' && <CompanyEngineerMini />}
          {sub === 'ceo' && <CompanyCeoMini />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function TourSection({ onLaunch }: { onLaunch: () => void }) {
  const [tab, setTab] = useState<TourTab>('seeker')
  const [auto, setAuto] = useState(true)
  const [paused, setPaused] = useState(false)

  // Gentle auto-tour until the visitor takes over.
  useEffect(() => {
    if (!auto || paused) return
    const id = setInterval(() => {
      setTab((t) => (t === 'seeker' ? 'recruiter' : t === 'recruiter' ? 'company' : 'seeker'))
    }, 5200)
    return () => clearInterval(id)
  }, [auto, paused])

  const activeTheme = roleTheme[tab === 'seeker' ? 'blue' : tab === 'recruiter' ? 'emerald' : 'violet']

  return (
    <section
      id="tour"
      aria-label="Product tour"
      className="relative mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-20 sm:px-6 sm:py-24"
    >
      <LandHeading
        eyebrow="Product tour"
        accent="violet"
        title={
          <>
            One app. <GradientText accent="violet">Three points of view.</GradientText>
          </>
        }
        description="A guided look at the three shells. Watch it cycle, click the tabs yourself — or launch the real thing and explore every corner."
      />

      <Reveal dir="flip" amount={0.25} className="relative mx-auto mt-12 max-w-5xl">
        {/* Glow bed behind the window */}
        <div
          aria-hidden
          className="absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-blue-500/15 via-violet-500/15 to-emerald-500/15 blur-2xl"
        />
        <div className="glass-strong relative overflow-hidden rounded-2xl">
          {/* Browser chrome */}
          <div className="flex items-center gap-3 border-b border-white/8 bg-white/[0.03] px-4 py-3">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-rose-400/80" />
              <span className="size-2.5 rounded-full bg-amber-400/80" />
              <span className="size-2.5 rounded-full bg-emerald-400/80" />
            </span>
            <span className="glass mx-auto flex w-full max-w-xs items-center justify-center gap-1.5 rounded-lg px-3 py-1 font-mono text-[11px] text-muted-foreground">
              <Lock className="size-3 text-emerald-400" aria-hidden />
              localhost:3000
            </span>
            <span className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:flex">
              {auto && !paused ? <LiveDot tone="emerald" /> : null}
              {auto && !paused ? 'Auto tour' : 'Manual'}
            </span>
          </div>

          {/* Shell tabs */}
          <div role="tablist" aria-label="Choose a shell" className="flex gap-1 border-b border-white/8 px-3 pt-2">
            {TOUR_TABS.map((t) => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setTab(t.id)
                    setAuto(false)
                  }}
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                  className={cn(
                    'relative flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    active ? t.text : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <t.icon className="size-4" aria-hidden />
                  {t.label}
                  {active && (
                    <motion.span
                      layoutId="tour-tab"
                      className={cn(
                        'absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r',
                        t.gradient,
                      )}
                      transition={spring}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Viewport: mini sidebar + active mock */}
          <div className="bg-cosmos-soft flex min-h-[430px]">
            <div
              aria-hidden
              className="hidden w-12 shrink-0 flex-col items-center gap-2.5 border-r border-white/8 bg-white/[0.02] py-4 sm:flex"
            >
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-lg bg-gradient-to-br text-[9px] font-black text-white shadow-md',
                  activeTheme.gradient,
                )}
              >
                TB
              </span>
              <span className="h-px w-6 bg-white/10" />
              {TOUR_TABS.map((t) => (
                <span
                  key={t.id}
                  className={cn(
                    'size-8 rounded-lg transition-colors duration-300',
                    tab === t.id
                      ? cn('bg-gradient-to-br shadow-md', t.gradient)
                      : 'border border-white/8 bg-white/[0.04]',
                  )}
                />
              ))}
            </div>
            <div className="min-w-0 flex-1 p-4 sm:p-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  role="tabpanel"
                >
                  {tab === 'seeker' && <SeekerMock />}
                  {tab === 'recruiter' && <RecruiterMock />}
                  {tab === 'company' && <CompanyMock />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-center">
          <p className="text-xs text-muted-foreground">
            Scaled-down preview — the real thing is fully interactive.
          </p>
          <button
            type="button"
            onClick={onLaunch}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
          >
            Try it live
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </button>
        </div>
      </Reveal>
    </section>
  )
}

/* ================================================================== */
/* 3 · FEATURES — everything is implemented                            */
/* ================================================================== */

const FEATURES: {
  icon: LucideIcon
  accent: Accent
  title: string
  text: string
  chip: string
}[] = [
  {
    icon: MessageSquare,
    accent: 'blue',
    title: 'Two-way realtime DMs',
    text: 'Seekers and recruiters chat in threads that poll live — unread badges, presence dot and one-click navigation from notifications.',
    chip: '3.5s live polling',
  },
  {
    icon: Flag,
    accent: 'emerald',
    title: 'Flagged calendar events',
    text: 'Recruiters schedule interviews for a specific candidate — the event shows up flagged on exactly that person\'s calendar.',
    chip: 'Interview · Meeting · Call',
  },
  {
    icon: Bell,
    accent: 'violet',
    title: 'One bell, two signals',
    text: 'A live badge counts DMs and calendar invites together. One click jumps straight to the thread or the event dialog.',
    chip: 'DM + Event channels',
  },
  {
    icon: LayoutDashboard,
    accent: 'violet',
    title: 'Company command center',
    text: 'Hiring funnel, DM activity per recruiter, candidate pipeline, audit trail, API/DB health and CEO KPIs — read-only and live.',
    chip: '4 sub-views',
  },
  {
    icon: ShieldCheck,
    accent: 'emerald',
    title: 'Secure by design',
    text: 'JWT sessions with bcrypt-hashed passwords, role-based access control and an immutable login audit trail.',
    chip: 'JWT + bcrypt',
  },
  {
    icon: Database,
    accent: 'blue',
    title: 'Zero-setup demo data',
    text: 'Nine seeded personas with realistic threads, events and notifications. Restart the demo state with a single seed command.',
    chip: '9 accounts · 1 password',
  },
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-label="Features"
      className="relative mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-20 sm:px-6 sm:py-24"
    >
      <LandHeading
        eyebrow="Under the hood"
        accent="emerald"
        title={
          <>
            Everything below is <GradientText accent="blue">implemented</GradientText> — no mockups.
          </>
        }
        description="TalentBridge_V2 runs entirely on this machine: Next.js 16 App Router, Prisma + SQLite, JWT auth and live polling. Real endpoints, real data, real notifications."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => {
          const theme = roleTheme[f.accent]
          const dirs: ('up' | 'left' | 'right')[] = ['up', 'left', 'right']
          return (
            <Reveal
              key={f.title}
              dir={dirs[i % 3]}
              delay={(i % 3) * 0.09}
              className="h-full"
            >
              <MotionCard accent={f.accent} className="group h-full p-6">
                <IconTile
                  icon={f.icon}
                  gradient={theme.gradient}
                  glow="shadow-lg"
                  className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                />
                <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-white/8 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-muted-foreground">
                  {f.chip}
                </span>
              </MotionCard>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

/* ================================================================== */
/* 4 · HOW IT WORKS — the demo loop in three steps                     */
/* ================================================================== */

const STEPS: { icon: LucideIcon; accent: Accent; step: string; title: string; text: string }[] = [
  {
    icon: UserRound,
    accent: 'blue',
    step: '01',
    title: 'Pick a persona',
    text: 'Nine seeded accounts across three worlds — every one reachable with a single click from the sign-in screen.',
  },
  {
    icon: CalendarDays,
    accent: 'emerald',
    step: '02',
    title: 'Work the loop',
    text: 'Nikhil schedules an interview with Aarav — the event lands flagged on Aarav\'s calendar and his bell lights up instantly.',
  },
  {
    icon: Radar,
    accent: 'violet',
    step: '03',
    title: 'Watch the company',
    text: 'Meera\'s command center sees the funnel fill, the DMs flow and every login hit the audit trail — all live.',
  },
]

export function HowSection() {
  return (
    <section
      id="how"
      aria-label="How the demo works"
      className="relative mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-20 sm:px-6 sm:py-24"
    >
      <LandHeading
        eyebrow="The demo loop"
        accent="blue"
        center
        title={
          <>
            Three steps to feel the <GradientText accent="violet">whole system</GradientText>.
          </>
        }
      />
      <div className="relative mt-14">
        {/* Connector draws itself as you scroll through */}
        <DrawLine
          d="M 0 20 C 130 -8, 270 48, 400 20"
          viewBox="0 0 400 40"
          width={1.5}
          className="absolute left-[16%] right-[16%] top-5 hidden h-10 lg:block"
        >
          <defs>
            <linearGradient id="tb-connector" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#60a5fa" stopOpacity="0.55" />
              <stop offset="0.5" stopColor="#a78bfa" stopOpacity="0.6" />
              <stop offset="1" stopColor="#34d399" stopOpacity="0.55" />
            </linearGradient>
          </defs>
        </DrawLine>
        <div className="grid gap-5 lg:grid-cols-3">
          {STEPS.map((s, i) => {
            const theme = roleTheme[s.accent]
            return (
              <Reveal key={s.step} dir="up" delay={i * 0.16} amount={0.4}>
                <div className="glass relative h-full rounded-2xl p-6 text-center transition-transform duration-300 hover:-translate-y-1">
                  <span
                    className={cn(
                      'relative z-10 mx-auto flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-black text-white shadow-lg',
                      theme.gradient,
                    )}
                  >
                    {s.step}
                  </span>
                  <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/* 5 · DEMO ACCOUNTS — the seeded cast                                 */
/* ================================================================== */

const GROUPS: {
  label: string
  icon: LucideIcon
  accent: Accent
  accounts: { name: string; title: string; email: string }[]
}[] = [
  {
    label: 'Job Seekers',
    icon: UserRound,
    accent: 'blue',
    accounts: [
      { name: 'Aarav Sharma', title: 'Frontend Developer', email: 'aarav@mail.com' },
      { name: 'Priya Patel', title: 'Data Analyst', email: 'priya@mail.com' },
      { name: 'Rohan Mehta', title: 'Backend Developer', email: 'rohan@mail.com' },
      { name: 'Sneha Kapoor', title: 'Cybersecurity Analyst', email: 'sneha@mail.com' },
    ],
  },
  {
    label: 'Recruiters',
    icon: UsersRound,
    accent: 'emerald',
    accounts: [
      { name: 'Nikhil Verma', title: 'Talent Lead', email: 'recruiter1@mail.com' },
      { name: 'Ananya Iyer', title: 'Technical Recruiter', email: 'recruiter2@mail.com' },
    ],
  },
  {
    label: 'Company',
    icon: Building2,
    accent: 'violet',
    accounts: [
      { name: 'Vikram Rao', title: 'Cyber Security Head', email: 'cyber@mail.com' },
      { name: 'Dev Menon', title: 'Lead Engineer', email: 'eng@mail.com' },
      { name: 'Meera Nair', title: 'CEO', email: 'ceo@mail.com' },
    ],
  },
]

export function DemoSection() {
  return (
    <section
      id="demo"
      aria-label="Demo accounts"
      className="relative mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-20 sm:px-6 sm:py-24"
    >
      <LandHeading
        eyebrow="The cast"
        accent="violet"
        title={
          <>
            Nine personas, <GradientText accent="emerald">ready to log in</GradientText>.
          </>
        }
        description="Seeded with realistic conversations, events and notifications — so the demo feels lived-in from the first second."
      />
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {GROUPS.map((g, i) => {
          const theme = roleTheme[g.accent]
          const dirs: ('left' | 'up' | 'right')[] = ['left', 'up', 'right']
          return (
            <Reveal key={g.label} dir={dirs[i % 3]} delay={i * 0.1} className="h-full">
              <MotionCard accent={g.accent} className="h-full p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5">
                    <IconTile icon={g.icon} gradient={theme.gradient} className="size-9 rounded-lg" />
                    <span className="text-sm font-semibold text-foreground">{g.label}</span>
                  </span>
                  <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', theme.badge)}>
                    {g.accounts.length}
                  </span>
                </div>
                <ul className="mt-4 space-y-1">
                  {g.accounts.map((a) => (
                    <li
                      key={a.email}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04]"
                    >
                      <span
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white shadow-md',
                          theme.gradient,
                        )}
                      >
                        {initials(a.name)}
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-xs font-medium text-foreground">
                          {a.name}
                        </span>
                        <span className="block truncate text-[10px] text-muted-foreground">
                          {a.title}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground/80">
                        {a.email}
                      </span>
                    </li>
                  ))}
                </ul>
              </MotionCard>
            </Reveal>
          )
        })}
      </div>
      <Parallax speed={24} className="mx-auto mt-8 w-fit">
        <Reveal dir="scale">
          <p className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-xs text-muted-foreground">
            <KeyRound className="size-3.5 text-cyan-300" aria-hidden />
            Every account uses the password
            <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-foreground">
              123456
            </span>
            — or use the one-click chips on the sign-in screen.
          </p>
        </Reveal>
      </Parallax>
    </section>
  )
}
