'use client'

/**
 * TalentBridge_V2 — cinematic login screen.
 * Cosmos backdrop + floating aurora blobs + grid drift; glass login card with
 * gradient hairline border; 9 one-click demo chips grouped by role.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  CalendarDays,
  Gauge,
  Loader2,
  LogIn,
  Mail,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from './auth-context'
import { initials, toastError } from './tb-utils'
import { fadeUp, spring, stagger } from './tb-motion'

interface DemoAccount {
  name: string
  email: string
  caption: string
}

const SEEKERS: DemoAccount[] = [
  { name: 'Aarav Sharma', email: 'aarav@mail.com', caption: 'Frontend Dev' },
  { name: 'Priya Patel', email: 'priya@mail.com', caption: 'Data Analyst' },
  { name: 'Rohan Mehta', email: 'rohan@mail.com', caption: 'Backend Dev' },
  { name: 'Sneha Kapoor', email: 'sneha@mail.com', caption: 'Cyber Analyst' },
]

const RECRUITERS: DemoAccount[] = [
  { name: 'Nikhil Verma', email: 'recruiter1@mail.com', caption: 'Talent Lead' },
  { name: 'Ananya Iyer', email: 'recruiter2@mail.com', caption: 'Tech Recruiter' },
]

const COMPANY: DemoAccount[] = [
  { name: 'Vikram Rao', email: 'cyber@mail.com', caption: 'Cyber Head' },
  { name: 'Dev Menon', email: 'eng@mail.com', caption: 'Lead Engineer' },
  { name: 'Meera Nair', email: 'ceo@mail.com', caption: 'CEO' },
]

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Real-time DMs',
    text: 'Chat instantly with recruiters and candidates.',
    tone: 'from-blue-500/25 to-cyan-400/10 text-blue-300',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: CalendarDays,
    title: 'Shared calendar',
    text: 'Interviews, calls and meetings in one place.',
    tone: 'from-emerald-500/25 to-teal-400/10 text-emerald-300',
    glow: 'shadow-emerald-500/20',
  },
  {
    icon: Gauge,
    title: 'Command Center',
    text: 'Live pipeline, audit and system insights.',
    tone: 'from-violet-500/25 to-fuchsia-400/10 text-violet-300',
    glow: 'shadow-violet-500/20',
  },
]

const TONES = {
  seeker: 'from-blue-500 to-cyan-400',
  recruiter: 'from-emerald-500 to-teal-400',
  company: 'from-violet-500 to-fuchsia-400',
} as const

const CHIP_GLOW = {
  seeker: 'hover:shadow-[0_4px_24px_-8px] hover:shadow-blue-500/40',
  recruiter: 'hover:shadow-[0_4px_24px_-8px] hover:shadow-emerald-500/40',
  company: 'hover:shadow-[0_4px_24px_-8px] hover:shadow-violet-500/40',
} as const

function DemoGroup({
  label,
  accounts,
  tone,
  cols,
  pendingEmail,
  onPick,
}: {
  label: string
  accounts: DemoAccount[]
  tone: keyof typeof TONES
  cols: string
  pendingEmail: string | null
  onPick: (account: DemoAccount) => void
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className={cn('mt-2 grid gap-2', cols)}>
        {accounts.map((acc) => (
          <motion.button
            key={acc.email}
            type="button"
            disabled={pendingEmail !== null}
            onClick={() => onPick(acc)}
            whileTap={{ scale: 0.96 }}
            transition={spring}
            className={cn(
              'group relative flex items-center gap-2 overflow-hidden rounded-xl border border-white/8 bg-white/[0.04] px-2.5 py-2 text-left backdrop-blur transition-all duration-200',
              'hover:border-white/20 hover:bg-white/[0.08]',
              CHIP_GLOW[tone],
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white shadow-md transition-transform duration-200 group-hover:scale-105',
                TONES[tone],
              )}
            >
              {initials(acc.name)}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-xs font-medium text-foreground">{acc.name}</span>
              <span className="block truncate text-[10px] text-muted-foreground">{acc.caption}</span>
            </span>
            {pendingEmail === acc.email && (
              <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  async function doLogin(mail: string, pwd: string) {
    setError(null)
    try {
      await login(mail, pwd)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      toastError(message)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    await doLogin(email, password)
    setSubmitting(false)
  }

  async function handleDemo(account: DemoAccount) {
    if (pendingEmail) return
    setPendingEmail(account.email)
    await doLogin(account.email, '123456')
    setPendingEmail(null)
  }

  return (
    <div className="bg-cosmos relative flex min-h-screen overflow-hidden">
      {/* Backdrop: aurora blobs + drifting grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-blob animate-aurora-a left-[-12%] top-[-18%] size-[36rem] bg-blue-600/25" />
        <div className="aurora-blob animate-aurora-b right-[-10%] top-[18%] size-[30rem] bg-violet-600/20" />
        <div className="aurora-blob animate-aurora-c bottom-[-22%] left-[28%] size-[34rem] bg-emerald-500/15" />
        <div className="bg-grid animate-grid-drift absolute inset-0" />
      </div>

      {/* Branding panel (left) */}
      <motion.div
        className="relative z-10 hidden w-[46%] flex-col justify-between p-12 lg:flex"
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-base font-black tracking-tight text-white shadow-[0_0_30px_-4px] shadow-blue-500/60">
            TB
          </span>
          <span className="text-xl font-semibold tracking-tight text-white">
            TalentBridge<span className="align-super text-xs text-cyan-300">V2</span>
          </span>
        </motion.div>

        <motion.div variants={fadeUp} className="max-w-lg space-y-6">
          <h1 className="text-5xl font-bold leading-[1.06] tracking-tight text-white">
            Bridging{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              talent
            </span>{' '}
            to{' '}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-transparent">
              opportunity.
            </span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            The dark-first recruiting hub — direct messages, shared calendars and a
            live command center, all in one orbit.
          </p>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass group flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 hover:bg-white/[0.07]"
              >
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-transform duration-200 group-hover:scale-105',
                    f.tone,
                    f.glow,
                  )}
                >
                  <f.icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{f.title}</span>
                  <span className="block text-xs text-muted-foreground">{f.text}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <ShieldCheck className="size-4 text-emerald-400" aria-hidden />
          JWT sessions · bcrypt hashing · role-based access
        </motion.p>
      </motion.div>

      {/* Login card (right) */}
      <div className="relative z-10 flex w-full items-center justify-center p-4 py-10 sm:p-8 lg:w-[54%]">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile brand row */}
          <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-base font-black tracking-tight text-white shadow-[0_0_30px_-4px] shadow-blue-500/60">
              TB
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              TalentBridge<span className="align-super text-[10px] text-cyan-300">V2</span>
            </span>
          </div>

          {/* Gradient hairline border wrapper */}
          <div className="rounded-2xl bg-gradient-to-b from-white/25 via-white/10 to-white/5 p-px shadow-[0_30px_80px_-20px_oklch(0_0_0/70%)]">
            <div className="rounded-2xl bg-[oklch(0.16_0.022_275/85%)] p-5 backdrop-blur-2xl sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles className="size-4 text-cyan-300" aria-hidden />
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Welcome back</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert
                    variant="destructive"
                    role="alert"
                    className="glass-destructive border-destructive/40 text-red-300"
                  >
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                  <div className="group relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-300"
                      aria-hidden
                    />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@mail.com"
                      className="border-white/10 bg-white/[0.05] pl-9 transition-shadow duration-200 focus-visible:shadow-[0_0_0_3px_oklch(0.65_0.15_262/0.18)] focus-visible:ring-cyan-400/40"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-muted-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••"
                    className="border-white/10 bg-white/[0.05] transition-shadow duration-200 focus-visible:shadow-[0_0_0_3px_oklch(0.65_0.15_262/0.18)] focus-visible:ring-cyan-400/40"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="shine h-11 w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:from-blue-400 hover:to-cyan-300 hover:shadow-blue-500/45 active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <LogIn className="size-4" aria-hidden />
                    )}
                    Sign in
                  </span>
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <Separator className="flex-1 bg-white/10" />
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Bell className="size-3" aria-hidden /> One-click demo access
                </span>
                <Separator className="flex-1 bg-white/10" />
              </div>

              <div className="space-y-4">
                <DemoGroup
                  label="Job Seekers"
                  accounts={SEEKERS}
                  tone="seeker"
                  cols="grid-cols-2"
                  pendingEmail={pendingEmail}
                  onPick={handleDemo}
                />
                <DemoGroup
                  label="Recruiters"
                  accounts={RECRUITERS}
                  tone="recruiter"
                  cols="grid-cols-2"
                  pendingEmail={pendingEmail}
                  onPick={handleDemo}
                />
                <DemoGroup
                  label="Company"
                  accounts={COMPANY}
                  tone="company"
                  cols="grid-cols-2 sm:grid-cols-3"
                  pendingEmail={pendingEmail}
                  onPick={handleDemo}
                />
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            Demo environment — every account uses the password{' '}
            <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              123456
            </span>
          </p>

          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('tb:replay-intro'))}
              className="group inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] text-muted-foreground/70 transition-colors hover:text-cyan-300"
            >
              <RotateCcw
                className="size-3 transition-transform duration-300 group-hover:-rotate-180"
                aria-hidden
              />
              Replay the intro
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
