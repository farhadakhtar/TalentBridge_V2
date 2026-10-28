'use client'

/**
 * TalentBridge_V2 — landing shared bits.
 * Heading / icon-tile / gradient-text / pointer-tilt-card primitives that
 * reuse the app's dark design language (roleTheme + tb-motion kit) so the
 * landing and the product feel like one continuous universe.
 *
 * Also hosts the scroll-FX kit: directional Reveal wrappers, scroll-linked
 * Parallax layers, word-by-word headline reveals and self-drawing SVG lines.
 */
import { useRef, type ReactNode } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionStyle,
} from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { roleTheme, type Accent } from '@/components/talentbridge/tb-utils'
import { EASE, fadeUp } from '@/components/talentbridge/tb-motion'

/* ------------------------------------------------------------------ */
/* Reveal — directional scroll-into-view wrapper                        */
/* ------------------------------------------------------------------ */

export type RevealDir = 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur' | 'flip'

const HIDDEN: Record<RevealDir, Record<string, number | string>> = {
  up: { opacity: 0, y: 48 },
  down: { opacity: 0, y: -48 },
  left: { opacity: 0, x: -64 },
  right: { opacity: 0, x: 64 },
  scale: { opacity: 0, scale: 0.86 },
  blur: { opacity: 0, y: 24, filter: 'blur(12px)' },
  flip: { opacity: 0, rotateX: -28, y: 40, transformPerspective: 900 },
}

export function Reveal({
  children,
  dir = 'up',
  delay = 0,
  duration = 0.65,
  className,
  once = true,
  amount = 0.35,
}: {
  children: ReactNode
  dir?: RevealDir
  delay?: number
  duration?: number
  className?: string
  once?: boolean
  amount?: number
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : HIDDEN[dir]}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Parallax — scroll-linked translate (element drifts while you scroll) */
/* ------------------------------------------------------------------ */

export function Parallax({
  children,
  /** Positive = moves slower (drifts down as you scroll past). */
  speed = 40,
  /** Optional scale drift across the scroll range, e.g. [1.08, 1]. */
  scale,
  /** Optional opacity drift, e.g. [1, 0.4]. */
  opacity,
  className,
  style,
}: {
  children: ReactNode
  speed?: number
  scale?: [number, number]
  opacity?: [number, number]
  className?: string
  style?: MotionStyle
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed])
  const s = useTransform(scrollYProgress, [0, 1], scale ?? [1, 1])
  const o = useTransform(scrollYProgress, [0, 1], opacity ?? [1, 1])

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y: reduced ? 0 : y, scale: reduced ? 1 : s, opacity: reduced ? 1 : o, ...style }}>
        {children}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* WordReveal — headline that lights up word-by-word on scroll          */
/* ------------------------------------------------------------------ */

export function WordReveal({
  text,
  className,
  wordClassName,
  stagger = 0.07,
}: {
  text: string
  className?: string
  /** Applied to every word span (e.g. a gradient text class). */
  wordClassName?: string
  stagger?: number
}) {
  const reduced = useReducedMotion()
  const words = text.split(' ')
  return (
    <motion.span
      className={cn('inline', className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: reduced ? 0 : stagger }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className={cn('inline-block will-change-transform', wordClassName)}
          variants={{
            hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
            show: { opacity: 1, y: 0, filter: 'blur(0px)' },
          }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.span>
  )
}

/* ------------------------------------------------------------------ */
/* DrawLine — SVG path that draws itself while scrolled through         */
/* ------------------------------------------------------------------ */

export function DrawLine({
  d,
  stroke = 'url(#tb-connector)',
  width = 2,
  viewBox = '0 0 400 60',
  className,
  children,
}: {
  d: string
  stroke?: string
  width?: number
  viewBox?: string
  className?: string
  /** Optional <defs> children (gradients). */
  children?: ReactNode
}) {
  const reduced = useReducedMotion()
  return (
    <svg viewBox={viewBox} fill="none" className={className} aria-hidden preserveAspectRatio="none">
      {children}
      <motion.path
        d={d}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        initial={{ pathLength: reduced ? 1 : 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.3, ease: EASE }}
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* LandHeading — section heading with gradient eyebrow rail            */
/* ------------------------------------------------------------------ */

export function LandHeading({
  eyebrow,
  accent = 'blue',
  title,
  description,
  center,
  className,
}: {
  eyebrow: string
  accent?: Accent
  title: ReactNode
  description?: ReactNode
  center?: boolean
  className?: string
}) {
  const theme = roleTheme[accent]
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={cn('max-w-2xl', center && 'mx-auto text-center', className)}
    >
      <p
        className={cn(
          'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]',
          theme.text,
          center && 'justify-center',
        )}
      >
        <span className={cn('h-px w-7 bg-gradient-to-r', theme.gradient)} aria-hidden />
        {eyebrow}
        {center ? (
          <span className={cn('h-px w-7 bg-gradient-to-l', theme.gradient)} aria-hidden />
        ) : null}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* IconTile — gradient square icon chip                                */
/* ------------------------------------------------------------------ */

export function IconTile({
  icon: Icon,
  gradient,
  glow,
  className,
}: {
  icon: LucideIcon
  /** Tailwind gradient stops, e.g. "from-blue-500 to-cyan-400" */
  gradient: string
  glow?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
        gradient,
        glow,
        className,
      )}
    >
      <Icon className="size-5" aria-hidden />
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* GradientText — role-gradient inline text                            */
/* ------------------------------------------------------------------ */

export function GradientText({
  accent = 'blue',
  children,
}: {
  accent?: Accent
  children: ReactNode
}) {
  return <span className={roleTheme[accent].gradientText}>{children}</span>
}

/* ------------------------------------------------------------------ */
/* TiltCard — pointer-tracked 3D tilt (spring smoothed, subtle)        */
/* ------------------------------------------------------------------ */

export function TiltCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 20 })
  const sry = useSpring(ry, { stiffness: 200, damping: 20 })

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    ry.set(px * 6)
    rx.set(-py * 6)
  }
  function handleLeave() {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
      className={cn('transform-gpu [transform-style:preserve-3d]', className)}
    >
      {children}
    </motion.div>
  )
}
