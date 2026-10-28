'use client'

/**
 * TalentBridge_V2 — cinematic landing page.
 * Theme-inspired by the app itself: cosmos nebula backdrop, glass surfaces,
 * aurora blobs, role gradients (blue · emerald · violet) and the tb-motion kit.
 * Scroll-linked parallax layers, self-drawing connectors and directional
 * reveals throughout — the final CTA fires the liftoff sequence into the app.
 */
import { useRef, useState, useEffect } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  ChevronDown,
  Flag,
  Link2,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE, LiveDot, fadeUp, stagger } from '@/components/talentbridge/tb-motion'
import { CountUp } from '@/components/talentbridge/tb-motion'
import { GradientText, Reveal, WordReveal } from './landing-bits'
import {
  DemoSection,
  FeaturesSection,
  HowSection,
  TourSection,
  WorldsSection,
} from './landing-sections'

/* ------------------------------------------------------------------ */
/* Scroll progress beam + right-side progress rail                     */
/* ------------------------------------------------------------------ */

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 })
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-400"
    />
  )
}

/** Vertical progress rail with anchor dots (desktop only). */
function ScrollRail() {
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 })
  const DOTS = [
    { href: '#top', label: 'Intro' },
    { href: '#roles', label: 'Roles' },
    { href: '#tour', label: 'Tour' },
    { href: '#features', label: 'Features' },
    { href: '#how', label: 'How' },
    { href: '#demo', label: 'Demo' },
    { href: '#launch', label: 'Launch' },
  ]
  return (
    <nav
      aria-label="Section progress"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 xl:flex"
    >
      <span className="relative h-40 w-px overflow-hidden rounded-full bg-white/10">
        <motion.span
          aria-hidden
          style={{ scaleY, originY: 0 }}
          className="absolute inset-0 bg-gradient-to-b from-blue-400 via-violet-400 to-emerald-400"
        />
      </span>
      <div className="flex flex-col items-center gap-2.5">
        {DOTS.map((d) => (
          <a
            key={d.href}
            href={d.href}
            aria-label={`Jump to ${d.label}`}
            className="size-1.5 rounded-full bg-white/25 transition-all duration-200 hover:scale-150 hover:bg-cyan-300"
          />
        ))}
      </div>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* Floating pill navigation                                            */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { href: '#roles', label: 'Roles' },
  { href: '#tour', label: 'Tour' },
  { href: '#features', label: 'Features' },
  { href: '#demo', label: 'Demo' },
]

function Nav({ onLaunch }: { onLaunch: () => void }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4"
    >
      <nav
        aria-label="Landing navigation"
        className={cn(
          'glass-strong mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-shadow duration-300 sm:px-4',
          scrolled && 'shadow-[0_18px_50px_-16px_oklch(0_0_0/75%)]',
        )}
      >
        <a href="#top" className="flex items-center gap-2.5 rounded-xl focus-visible:outline-cyan-300">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-black tracking-tight text-white shadow-[0_0_22px_-4px] shadow-blue-500/60">
            TB
          </span>
          <span className="hidden text-base font-semibold tracking-tight text-foreground sm:block">
            TalentBridge<span className="align-super text-[10px] text-cyan-300">V2</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={onLaunch}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="shine relative rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-colors hover:from-blue-400 hover:to-cyan-300"
        >
          <span className="relative z-10 flex items-center gap-1.5">
            Launch
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </motion.button>
      </nav>
    </motion.header>
  )
}

/* ------------------------------------------------------------------ */
/* The bridge — brand SVG with pulses traveling talent → opportunity   */
/* ------------------------------------------------------------------ */

const BRIDGE_PATH = 'M 90 150 C 260 40, 540 40, 710 150'

function BridgeVisual() {
  return (
    <motion.div variants={fadeUp} className="relative mx-auto mt-14 w-full max-w-3xl" aria-hidden>
      <svg viewBox="0 0 800 210" fill="none" className="w-full">
        <defs>
          <linearGradient id="tb-bridge" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#60a5fa" />
            <stop offset="0.5" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#34d399" />
          </linearGradient>
          <filter id="tb-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow underlay + main deck */}
        <path d={BRIDGE_PATH} stroke="url(#tb-bridge)" strokeWidth="10" strokeLinecap="round" opacity="0.16" />
        <path d={BRIDGE_PATH} stroke="url(#tb-bridge)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Faint lower deck */}
        <path
          d="M 90 172 C 260 74, 540 74, 710 172"
          stroke="oklch(1 0 0 / 0.08)"
          strokeWidth="1.5"
          strokeDasharray="2 9"
        />

        {/* Left node — talent */}
        <circle cx="90" cy="150" r="30" fill="#60a5fa" opacity="0.08" />
        <circle cx="90" cy="150" r="9" fill="#60a5fa" filter="url(#tb-glow)" />
        <circle cx="90" cy="150" r="9" fill="none" stroke="#60a5fa">
          <animate attributeName="r" values="9;32" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.55;0" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <text
          x="90"
          y="196"
          textAnchor="middle"
          letterSpacing="4"
          className="fill-blue-300 text-[11px] font-semibold"
        >
          TALENT
        </text>

        {/* Right node — opportunity */}
        <circle cx="710" cy="150" r="30" fill="#34d399" opacity="0.08" />
        <circle cx="710" cy="150" r="9" fill="#34d399" filter="url(#tb-glow)" />
        <circle cx="710" cy="150" r="9" fill="none" stroke="#34d399">
          <animate attributeName="r" values="9;32" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.55;0" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
        </circle>
        <text
          x="710"
          y="196"
          textAnchor="middle"
          letterSpacing="4"
          className="fill-emerald-300 text-[11px] font-semibold"
        >
          OPPORTUNITY
        </text>

        {/* Traveling pulses (hidden under prefers-reduced-motion) */}
        <g className="bridge-pulse">
          <circle r="4.5" fill="#7dd3fc" opacity="0.95" filter="url(#tb-glow)">
            <animateMotion dur="3.8s" repeatCount="indefinite" begin="0s" path={BRIDGE_PATH} />
          </circle>
          <circle r="4.5" fill="#c4b5fd" opacity="0.95" filter="url(#tb-glow)">
            <animateMotion dur="3.8s" repeatCount="indefinite" begin="1.3s" path={BRIDGE_PATH} />
          </circle>
          <circle r="4.5" fill="#6ee7b7" opacity="0.95" filter="url(#tb-glow)">
            <animateMotion dur="3.8s" repeatCount="indefinite" begin="2.6s" path={BRIDGE_PATH} />
          </circle>
        </g>
      </svg>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

const HERO_STATS: { value: number | null; display?: string; label: string; accent: string }[] = [
  { value: 9, label: 'Demo personas', accent: 'from-blue-400 to-cyan-300' },
  { value: 3, label: 'Role worlds', accent: 'from-emerald-400 to-teal-300' },
  { value: 6, label: 'Live data models', accent: 'from-violet-400 to-fuchsia-300' },
  { value: null, display: '100%', label: 'Local & private', accent: 'from-blue-400 to-emerald-300' },
]

function Hero({ onLaunch }: { onLaunch: () => void }) {
  const heroRef = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  // Content lifts + dissolves as the visitor scrolls on; backdrop drifts at a
  // different rate for depth; grid scales subtly.
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 140])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduced ? 1 : 0])
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 0.96])
  const backdropY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -90])
  const gridScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.12])

  return (
    <section
      ref={heroRef}
      aria-label="TalentBridge_V2 introduction"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-28 text-center sm:pt-32"
    >
      {/* Ambient backdrop — scroll-parallaxed */}
      <motion.div
        aria-hidden
        style={{ y: backdropY }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="aurora-blob animate-aurora-a left-[-14%] top-[-20%] size-[38rem] bg-blue-600/25" />
        <div className="aurora-blob animate-aurora-b right-[-12%] top-[16%] size-[32rem] bg-violet-600/20" />
        <div className="aurora-blob animate-aurora-c bottom-[-24%] left-[26%] size-[36rem] bg-emerald-500/15" />
        <motion.div style={{ scale: gridScale }} className="bg-grid animate-grid-drift absolute inset-0" />
      </motion.div>

      {/* Floating signal chips (desktop only) */}
      <motion.div
        variants={fadeUp}
        className="glass animate-aurora-c absolute left-[5%] top-[31%] hidden items-center gap-2 rounded-xl px-3 py-2 lg:flex"
        aria-hidden
      >
        <Bell className="size-3.5 text-violet-300" />
        <span className="text-xs text-muted-foreground">3 unread alerts</span>
      </motion.div>
      <motion.div
        variants={fadeUp}
        className="glass animate-aurora-a absolute right-[4%] top-[24%] hidden items-center gap-2 rounded-xl px-3 py-2 lg:flex"
        aria-hidden
      >
        <Flag className="size-3.5 text-amber-300" fill="currentColor" />
        <span className="text-xs text-muted-foreground">Interview · in 7 days</span>
      </motion.div>
      <motion.div
        variants={fadeUp}
        className="glass animate-aurora-b absolute bottom-[27%] right-[8%] hidden items-center gap-2 rounded-xl px-3 py-2 lg:flex"
        aria-hidden
      >
        <LiveDot tone="emerald" />
        <span className="text-xs text-muted-foreground">Nikhil is typing…</span>
      </motion.div>

      {/* Content — parallax dissolve */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
        className="relative z-10 w-full"
      >
        <motion.div variants={fadeUp}>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <LiveDot tone="emerald" />
            Local-first hiring universe · v2.0
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mx-auto mt-7 max-w-4xl text-balance text-5xl font-black leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
        >
          Where <GradientText accent="blue">talent</GradientText> meets{' '}
          <GradientText accent="emerald">opportunity</GradientText>.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          TalentBridge_V2 is a complete hiring loop in one dark, living dashboard —
          real-time DMs, a shared calendar that flags what&apos;s meant for you, a bell
          that never sleeps, and a company command center that sees the whole funnel.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <motion.button
            type="button"
            onClick={onLaunch}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="shine relative rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-7 py-3.5 text-sm font-bold text-white shadow-[0_14px_44px_-10px] shadow-blue-500/50 transition-colors hover:from-blue-400 hover:to-cyan-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              Launch the platform
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </motion.button>
          <motion.a
            href="#roles"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="glass inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-white/[0.08]"
          >
            Take the tour
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
          </motion.a>
        </motion.div>

        <BridgeVisual />

        <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-stretch justify-center gap-3">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="glass min-w-[7.5rem] rounded-xl px-4 py-3 text-center">
              <p
                className={cn(
                  'bg-gradient-to-r bg-clip-text text-xl font-black tabular-nums text-transparent',
                  s.accent,
                )}
              >
                {s.value === null ? s.display : <CountUp value={s.value} />}
              </p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#roles"
        aria-label="Scroll to explore"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full p-2 text-muted-foreground/70 transition-colors hover:text-foreground"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="size-5" aria-hidden />
      </motion.a>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Keyword marquee                                                     */
/* ------------------------------------------------------------------ */

const MARQUEE_ITEMS = [
  'Real-time DMs',
  'Flagged calendar events',
  'Smart notification bell',
  'Hiring funnel analytics',
  'Login audit trail',
  'Role-based command centers',
  'JWT + bcrypt auth',
  'Live 3.5s polling',
  'SQLite · Prisma · Next.js 16',
  'Zero-config demo data',
]

function MarqueeRow({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden}>
      {MARQUEE_ITEMS.map((item) => (
        <span key={item} className="flex items-center gap-10">
          <span className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {item}
          </span>
          <span
            className="size-1.5 rotate-45 rounded-[2px] bg-gradient-to-br from-blue-400 to-emerald-400"
            aria-hidden
          />
        </span>
      ))}
    </div>
  )
}

function Marquee() {
  return (
    <div
      aria-label="Platform highlights"
      className="mask-fade-x marquee-hover-pause relative overflow-hidden border-y border-white/8 bg-white/[0.02] py-4"
    >
      <div className="animate-marquee flex w-max">
        <MarqueeRow />
        <MarqueeRow hidden />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Final CTA — the literal door into http://localhost:3000             */
/* ------------------------------------------------------------------ */

function FinalCta({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section
      id="launch"
      aria-label="Launch TalentBridge_V2"
      className="relative mx-auto w-full max-w-5xl scroll-mt-28 px-4 pb-16 pt-8 sm:px-6 sm:pb-24"
    >
      <Reveal dir="scale" amount={0.25}>
        <div className="glass-strong bg-cosmos relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="aurora-blob animate-aurora-a left-[-10%] top-[-32%] size-72 bg-blue-600/25" />
            <div className="aurora-blob animate-aurora-c bottom-[-40%] right-[-6%] size-80 bg-emerald-500/20" />
            <div className="bg-grid absolute inset-0" />
          </div>

          <div className="relative">
            <p className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-px w-7 bg-gradient-to-r from-blue-400 to-cyan-300" aria-hidden />
              Ready for liftoff
              <span className="h-px w-7 bg-gradient-to-l from-blue-400 to-cyan-300" aria-hidden />
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              Ready to cross the <GradientText accent="emerald">bridge</GradientText>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
              <WordReveal text="Nine personas, three worlds and one shared calendar are already live on this machine. The door is open — step through it." />
            </p>

            <div className="mt-9 flex flex-col items-center gap-4">
              <div className="relative">
                {/* Breathing halo behind the launch button */}
                <motion.span
                  aria-hidden
                  className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-blue-500/40 via-violet-500/40 to-emerald-400/40 blur-lg"
                  animate={{ opacity: [0.45, 0.9, 0.45], scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.button
                  type="button"
                  onClick={onLaunch}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="shine relative rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-400 px-8 py-4 text-base font-bold text-white shadow-[0_16px_50px_-12px] shadow-violet-500/50"
                >
                  <span className="relative z-10 flex items-center gap-2.5">
                    Launch TalentBridge_V2
                    <ArrowRight className="size-5" aria-hidden />
                  </span>
                </motion.button>
              </div>
              <button
                type="button"
                onClick={onLaunch}
                className="group inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-cyan-300"
              >
                <Link2 className="size-3.5 transition-transform group-hover:-rotate-12" aria-hidden />
                http://localhost:3000
                <ArrowUpRight
                  className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="mt-auto border-t border-white/8 bg-white/[0.02] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-[10px] font-black text-white">
            TB
          </span>
          <p className="text-xs text-muted-foreground">
            TalentBridge_V2 — bridging talent to opportunity.
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground/70">
          Next.js 16 · TypeScript · Prisma · SQLite · Tailwind CSS · shadcn/ui
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
          <ShieldCheck className="size-3.5 text-emerald-400" aria-hidden />
          Local demo — data never leaves this machine
        </p>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* LandingPage — composition root                                      */
/* ------------------------------------------------------------------ */

export function LandingPage({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div id="top" className="bg-cosmos relative flex min-h-screen flex-col overflow-x-clip text-foreground">
      <ScrollProgress />
      <ScrollRail />
      <Nav onLaunch={onLaunch} />
      <main className="relative flex-1">
        <Hero onLaunch={onLaunch} />
        <Marquee />
        <WorldsSection />
        <TourSection onLaunch={onLaunch} />
        <FeaturesSection />
        <HowSection />
        <DemoSection />
        <FinalCta onLaunch={onLaunch} />
      </main>
      <Footer />
    </div>
  )
}
