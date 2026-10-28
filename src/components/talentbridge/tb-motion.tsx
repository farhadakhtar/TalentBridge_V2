'use client'

/**
 * TalentBridge_V2 — shared framer-motion kit.
 * One place for variants, springs and the small animated building blocks
 * (glass cards, count-ups, section headings, live dots, page transitions).
 */
import { useEffect, useRef, type ReactNode } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  type Variants,
} from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Accent } from './tb-utils'
import { roleTheme } from './tb-utils'

/* ------------------------------------------------------------------ */
/* Motion presets                                                      */
/* ------------------------------------------------------------------ */

/** Signature easing — fast out, long settle. */
export const EASE = [0.16, 1, 0.3, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: EASE } },
}

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

/** Snappy spring for layout pills / pops. */
export const spring = { type: 'spring', stiffness: 320, damping: 28 } as const

/** Softer spring for large surfaces. */
export const springSoft = { type: 'spring', stiffness: 210, damping: 26 } as const

/* ------------------------------------------------------------------ */
/* Stagger helpers                                                     */
/* ------------------------------------------------------------------ */

export function StaggerGroup({
  children,
  className,
  once = true,
}: {
  children: ReactNode
  className?: string
  once?: boolean
}) {
  return (
    <motion.div
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-40px' }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* MotionCard — glass card with hover lift + accent glow               */
/* ------------------------------------------------------------------ */

export function MotionCard({
  children,
  className,
  accent = 'blue',
  interactive = true,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  accent?: Accent
  /** Hover lift + glow (disable for static wrappers). */
  interactive?: boolean
  delay?: number
}) {
  const theme = roleTheme[accent]
  return (
    <motion.div
      className={cn(
        'relative rounded-xl border border-white/8 bg-white/[0.04] shadow-[inset_0_1px_0_0_oklch(1_0_0/5%)] backdrop-blur-xl',
        interactive &&
          cn(
            'transition-[border-color,box-shadow] duration-200',
            'hover:border-white/15',
            theme.cardGlowHover,
          ),
        className,
      )}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, ease: EASE, delay }}
      whileHover={interactive ? { y: -4 } : undefined}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* CountUp — eased integer counter that animates on first in-view      */
/* ------------------------------------------------------------------ */

export function CountUp({
  value,
  duration = 1.1,
  className,
}: {
  value: number
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, margin: '-24px' })

  useEffect(() => {
    if (!inView || !ref.current) return
    const node = ref.current
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = Math.round(v).toLocaleString('en-US')
      },
    })
    return () => controls.stop()
  }, [inView, value, duration])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {value.toLocaleString('en-US')}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* SectionHeading — eyebrow + title (gradient keyword ready) + right   */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  description,
  accent = 'blue',
  right,
  className,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  accent?: Accent
  right?: ReactNode
  className?: string
}) {
  const theme = roleTheme[accent]
  return (
    <motion.div
      variants={fadeUp}
      className={cn('flex flex-wrap items-end justify-between gap-3', className)}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p
            className={cn(
              'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]',
              theme.text,
            )}
          >
            <span className={cn('h-px w-6 bg-gradient-to-r', theme.gradient)} />
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* LiveDot — pulsing status dot                                        */
/* ------------------------------------------------------------------ */

const DOT_TONES: Record<string, { core: string; ping: string; pulse: string }> = {
  emerald: { core: 'bg-emerald-400', ping: 'bg-emerald-400/60', pulse: 'oklch(0.72 0.17 162 / 0.5)' },
  violet: { core: 'bg-violet-400', ping: 'bg-violet-400/60', pulse: 'oklch(0.6 0.21 300 / 0.5)' },
  amber: { core: 'bg-amber-400', ping: 'bg-amber-400/60', pulse: 'oklch(0.8 0.16 80 / 0.5)' },
  blue: { core: 'bg-blue-400', ping: 'bg-blue-400/60', pulse: 'oklch(0.62 0.19 262 / 0.5)' },
  rose: { core: 'bg-rose-400', ping: 'bg-rose-400/60', pulse: 'oklch(0.62 0.21 16 / 0.5)' },
}

export function LiveDot({
  tone = 'emerald',
  className,
}: {
  tone?: keyof typeof DOT_TONES
  className?: string
}) {
  const t = DOT_TONES[tone]
  return (
    <span className={cn('relative inline-flex size-2.5', className)}>
      <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full', t.ping)} />
      <span
        className={cn('relative inline-flex size-2.5 animate-pulse-ring rounded-full', t.core)}
        style={{ ['--pulse-color' as string]: t.pulse }}
      />
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* PageTransition — key-based fade/slide between sections              */
/* ------------------------------------------------------------------ */

export function PageTransition({
  sectionKey,
  children,
  className,
}: {
  sectionKey: string
  children: ReactNode
  className?: string
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={sectionKey}
        className={className}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
