'use client'

/**
 * TalentBridge_V2 — "liftoff" launch sequence.
 * Plays full-screen when the visitor fires a Launch CTA:
 *
 *   ignite → warp tunnel (star streaks + expanding rings) →
 *   TB monogram zoom-through → white flash (content swaps to the login
 *   underneath) → flash fades out revealing the sign-in screen.
 *
 * Honors prefers-reduced-motion with a fast, calm crossfade.
 */
import { useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  /** Fired at the white-flash peak — the page swaps to the app underneath. */
  onReveal: () => void
  /** Fired when the overlay finished fading out — unmount it. */
  onDone: () => void
}

interface Star {
  angle: number
  dist: number
  len: number
  delay: number
  dur: number
  color: string
}

/** Deterministic star field — no hydration mismatch (client-only anyway). */
function makeStars(count: number): Star[] {
  const colors = ['#60a5fa', '#a78bfa', '#34d399', '#7dd3fc', '#c4b5fd']
  return Array.from({ length: count }, (_, i) => {
    const golden = (i * 137.508) % 360 // golden-angle spread = even coverage
    return {
      angle: (golden * Math.PI) / 180,
      dist: 260 + ((i * 97) % 420),
      len: 60 + ((i * 53) % 130),
      delay: 0.1 + ((i * 31) % 400) / 1000,
      dur: 0.85 + ((i * 17) % 500) / 1000,
      color: colors[i % colors.length],
    }
  })
}

const RINGS = [0, 0.18, 0.36]

export function LaunchOverlay({ onReveal, onDone }: Props) {
  const reduced = useReducedMotion()
  const stars = useMemo(() => makeStars(42), [])

  useEffect(() => {
    if (reduced) {
      const reveal = window.setTimeout(onReveal, 450)
      const done = window.setTimeout(onDone, 900)
      return () => {
        window.clearTimeout(reveal)
        window.clearTimeout(done)
      }
    }
    // Warp reaches the white-flash peak at ~1.75s → swap → fade out.
    const reveal = window.setTimeout(onReveal, 1750)
    const done = window.setTimeout(onDone, 2350)
    return () => {
      window.clearTimeout(reveal)
      window.clearTimeout(done)
    }
  }, [onReveal, onDone, reduced])

  return (
    <motion.div
      role="status"
      aria-label="Launching TalentBridge_V2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-cosmos fixed inset-0 z-[90] flex items-center justify-center overflow-hidden"
    >
      {/* Deep-space vignette + drifting grid for continuity with the theme */}
      <div aria-hidden className="absolute inset-0">
        <div className="aurora-blob animate-aurora-a left-[10%] top-[8%] size-[30rem] bg-blue-600/20" />
        <div className="aurora-blob animate-aurora-b right-[8%] bottom-[10%] size-[26rem] bg-violet-600/15" />
        <div className="bg-grid animate-grid-drift absolute inset-0 opacity-60" />
      </div>

      {reduced ? (
        /* Calm path: logo pulse → flash */
        <div className="relative flex flex-col items-center gap-6">
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-black text-white shadow-[0_0_60px_-8px] shadow-blue-500/70"
          >
            TB
          </motion.span>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase"
          >
            Launching…
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 0.45, duration: 0.45 }}
            className="absolute inset-[-100vmax] bg-gradient-to-b from-white via-cyan-100 to-white"
          />
        </div>
      ) : (
        <>
          {/* Warp tunnel — star streaks accelerating outward */}
          <div aria-hidden className="absolute inset-0">
            {stars.map((star, i) => {
              const dx = Math.cos(star.angle) * star.dist
              const dy = Math.sin(star.angle) * star.dist
              return (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 origin-left rounded-full"
                  style={{
                    width: star.len,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${star.color})`,
                    rotate: `${(star.angle * 180) / Math.PI}deg`,
                  }}
                  initial={{ x: 0, y: 0, scaleX: 0.15, opacity: 0 }}
                  animate={{
                    x: [0, dx],
                    y: [0, dy],
                    scaleX: [0.15, 2.4],
                    opacity: [0, 0.95, 0],
                  }}
                  transition={{
                    delay: star.delay,
                    duration: star.dur,
                    ease: [0.16, 0.84, 0.44, 1],
                  }}
                />
              )
            })}

            {/* Expanding shock rings */}
            {RINGS.map((delay) => (
              <motion.span
                key={delay}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{
                  width: 140,
                  height: 140,
                  borderColor: delay === 0.18 ? 'oklch(1 0 0 / 0.25)' : 'oklch(0.7 0.15 250 / 0.35)',
                }}
                initial={{ scale: 0.2, opacity: 0.9 }}
                animate={{ scale: 3.4, opacity: 0 }}
                transition={{ delay: 0.25 + delay, duration: 1.1, ease: 'easeOut' }}
              />
            ))}
          </div>

          {/* Center piece — TB monogram zoom-through */}
          <div className="relative flex flex-col items-center">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.6, 1.15, 5.2], opacity: [0, 1, 0] }}
              transition={{
                delay: 0.35,
                duration: 1.3,
                times: [0, 0.42, 1],
                ease: [0.22, 0.9, 0.3, 1],
              }}
              className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 text-2xl font-black text-white shadow-[0_0_80px_-6px] shadow-blue-500/70"
            >
              TB
            </motion.span>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -14] }}
              transition={{ delay: 0.55, duration: 1.15, times: [0, 0.25, 0.75, 1] }}
              className="mt-7 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/90"
            >
              Entering TalentBridge_V2
            </motion.p>
          </div>

          {/* White flash — peak hides the content swap to the login */}
          <motion.div
            aria-hidden
            className="absolute inset-[-50vmax] bg-gradient-to-b from-white via-cyan-100 to-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 0] }}
            transition={{ delay: 0, duration: 2.1, times: [0, 0.76, 0.86, 1], ease: 'easeInOut' }}
          />
        </>
      )}
    </motion.div>
  )
}
