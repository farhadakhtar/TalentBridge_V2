'use client'

/**
 * TalentBridge_V2 — SPA root.
 * Logo glow-bloom splash → AnimatePresence swap between Login and Shell.
 */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useAuth } from './auth-context'
import { AppShell } from './app-shell'
import { LoginPage } from './login-page'

function Splash() {
  return (
    <motion.div
      key="splash"
      className="bg-cosmos fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="relative">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 blur-2xl"
          initial={{ opacity: 0.15, scale: 0.7 }}
          animate={{ opacity: [0.15, 0.75, 0.35], scale: [0.7, 1.25, 1.05] }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
        <motion.span
          className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-black tracking-tight text-white shadow-2xl"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          TB
        </motion.span>
      </div>
      <motion.p
        className="text-sm font-medium text-muted-foreground"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
      >
        Bridging talent to opportunity
      </motion.p>
      <motion.div
        className="flex items-center gap-2 text-xs text-muted-foreground/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        Loading TalentBridge_V2…
      </motion.div>
    </motion.div>
  )
}

export function TalentBridgeApp() {
  const { user, loading } = useAuth()
  // Minimum splash time so the glow bloom always plays (~600ms + settle).
  const [minSplash, setMinSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setMinSplash(false), 850)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="bg-background min-h-screen">
      <AnimatePresence>{(loading || minSplash) && <Splash key="splash" />}</AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        {!user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <LoginPage />
          </motion.div>
        ) : (
          <motion.div
            key="shell"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <AppShell user={user} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
