'use client'

/**
 * TalentBridge_V2 — the single app route, staged as a two-act experience.
 *
 *   Act 1 · cinematic landing (scroll animations, product tour, launch CTA)
 *   Act 2 · the real app (splash → login → role shell)
 *
 * "Launch" fires the liftoff overlay (warp tunnel → white flash); at the
 * flash peak the app tree mounts underneath, so the flash dissolves straight
 * into the sign-in screen. Within one browser session the intro is skipped
 * after the first launch (sessionStorage) — and can be replayed from the
 * sign-in screen via the `tb:replay-intro` window event.
 */
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/components/talentbridge/auth-context'
import { TalentBridgeApp } from '@/components/talentbridge/talentbridge-app'
import { LandingPage } from '@/components/landing/landing-page'
import { LaunchOverlay } from '@/components/landing/launch-overlay'
import { EASE } from '@/components/talentbridge/tb-motion'

const INTRO_FLAG = 'tb_intro_done'
const REPLAY_EVENT = 'tb:replay-intro'

export default function Home() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  const [view, setView] = useState<'landing' | 'app'>('landing')
  const [launching, setLaunching] = useState(false)

  // Skip the intro for the rest of the session once it has been launched.
  // Deferred macrotask (not sync in effect) so the landing paints first.
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        if (window.sessionStorage.getItem(INTRO_FLAG) === '1') setView('app')
      } catch {
        /* private mode — just show the intro */
      }
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  // "Replay the intro" from the sign-in screen.
  useEffect(() => {
    const onReplay = () => setView('landing')
    window.addEventListener(REPLAY_EVENT, onReplay)
    return () => window.removeEventListener(REPLAY_EVENT, onReplay)
  }, [])

  const handleLaunch = useCallback(() => setLaunching(true), [])

  // Flash peak → swap to the app underneath; overlay fades out right after.
  const revealApp = useCallback(() => {
    try {
      window.sessionStorage.setItem(INTRO_FLAG, '1')
    } catch {
      /* ignore */
    }
    setView('app')
  }, [])

  const launchDone = useCallback(() => setLaunching(false), [])

  const app = (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TalentBridgeApp />
      </AuthProvider>
    </QueryClientProvider>
  )

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <LandingPage onLaunch={handleLaunch} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {app}
          </motion.div>
        )}
      </AnimatePresence>

      {launching && <LaunchOverlay onReveal={revealApp} onDone={launchDone} />}
    </MotionConfig>
  )
}
