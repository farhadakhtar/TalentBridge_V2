'use client'

/**
 * TalentBridge_V2 — authenticated app shell (dark).
 * Glass sidebar with layoutId sliding active pill + glass topbar with
 * PageTransition-animated section title + cosmos content backdrop.
 */
import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Briefcase,
  CalendarDays,
  Gauge,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SafeUser } from '@/lib/types'
import { useAuth } from './auth-context'
import { CalendarView } from './calendar-view'
import { ChatView } from './chat-view'
import { CompanyDashboard } from './company-dashboard'
import { JobsView } from './jobs-view'
import { NotificationBell } from './notification-bell'
import { RecruiterDashboard } from './recruiter-dashboard'
import { SeekerDashboard } from './seeker-dashboard'
import { accentClasses, roleTheme, initials, type Accent } from './tb-utils'
import { PageTransition, springSoft } from './tb-motion'

type Section = 'dashboard' | 'jobs' | 'calendar' | 'messages'

const ROLE_LABEL: Record<SafeUser['role'], string> = {
  job_seeker: 'Job Seeker',
  recruiter: 'Recruiter',
  company: 'Company',
}

const SECTION_META: Record<Section, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your activity at a glance' },
  jobs: { title: 'Job Board', subtitle: 'Openings posted by recruiters' },
  calendar: { title: 'My Calendar', subtitle: 'Interviews, calls and meetings' },
  messages: { title: 'Messages', subtitle: 'Direct messages in real time' },
}

interface NavItem {
  key: Section
  label: string
  icon: typeof LayoutDashboard
}

export function AppShell({ user }: { user: SafeUser }) {
  const { logout } = useAuth()
  const [section, setSection] = useState<Section>('dashboard')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)

  const isCompany = user.role === 'company'
  const accent: Accent = user.role === 'recruiter' ? 'emerald' : user.role === 'company' ? 'violet' : 'blue'
  const theme = roleTheme[accent]

  const openConversation = useCallback((id: string) => {
    setConversationId(id)
    setSection('messages')
  }, [])

  const openEvent = useCallback((id: string) => {
    setEventId(id)
    setSection('calendar')
  }, [])

  const navItems: NavItem[] = isCompany
    ? [
        { key: 'dashboard', label: 'Command Center', icon: Home },
        { key: 'jobs', label: 'Job Board', icon: Briefcase },
      ]
    : [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'jobs', label: 'Jobs', icon: Briefcase },
        { key: 'calendar', label: 'My Calendar', icon: CalendarDays },
        { key: 'messages', label: 'Messages', icon: MessageSquare },
      ]

  const meta = SECTION_META[section]
  const isCompanyHome = isCompany && section === 'dashboard'
  const contentKey = isCompanyHome ? 'command' : section

  function renderSection() {
    if (section === 'jobs') return <JobsView user={user} accent={accent} onOpenConversation={openConversation} />
    if (isCompany) return <CompanyDashboard user={user} />
    if (section === 'dashboard') {
      return user.role === 'recruiter' ? (
        <RecruiterDashboard user={user} onOpenConversation={openConversation} />
      ) : (
        <SeekerDashboard user={user} onOpenConversation={openConversation} />
      )
    }
    if (section === 'calendar') {
      return (
        <CalendarView
          user={user}
          accent={accent}
          openEventId={eventId}
          onEventDialogClosed={() => setEventId(null)}
        />
      )
    }
    return (
      <ChatView
        user={user}
        accent={accent}
        selectedId={conversationId}
        onSelect={setConversationId}
      />
    )
  }

  return (
    <div className="bg-cosmos-soft flex h-screen overflow-hidden bg-background">
      {/* ------------------------------------------------ Sidebar */}
      <aside className="relative hidden w-64 shrink-0 flex-col border-r border-white/8 bg-white/[0.02] backdrop-blur-xl md:flex">
        {/* role tint */}
        <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 top-0 h-44', theme.sidebarTint)} />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 border-b border-white/8 px-5 py-5">
          <span
            className={cn(
              'flex size-10 items-center justify-center rounded-xl text-sm font-black tracking-tight',
              theme.logoSolid,
            )}
          >
            TB
          </span>
          <span className="font-semibold leading-tight text-foreground">
            TalentBridge
            <span className={cn('ml-1 align-super text-[10px] font-bold', theme.text)}>V2</span>
            <span className="block text-[10px] font-normal text-muted-foreground">
              Bridging talent to opportunity
            </span>
          </span>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = section === item.key
            return (
              <motion.button
                key={item.key}
                type="button"
                onClick={() => setSection(item.key)}
                aria-current={active ? 'page' : undefined}
                whileTap={{ scale: 0.98 }}
                transition={springSoft}
                className={cn(
                  'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors duration-200',
                  active ? theme.navActiveText : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tb-nav-pill"
                    className={cn(
                      'absolute inset-0 rounded-lg border border-white/10 bg-gradient-to-r',
                      theme.activePill,
                    )}
                    transition={springSoft}
                  />
                )}
                {active && (
                  <motion.span
                    layoutId="tb-nav-edge"
                    className={cn('absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-gradient-to-b', theme.activeEdge)}
                    transition={springSoft}
                  />
                )}
                <item.icon
                  className={cn('relative z-10 size-4 shrink-0 transition-colors duration-200', active && theme.text)}
                  aria-hidden
                />
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            )
          })}
        </nav>

        {/* User mini-card */}
        <div className="relative p-3">
          <div className="glass flex items-center gap-3 rounded-xl p-2">
            <span className={cn('rounded-full bg-gradient-to-br p-[2px]', theme.avatarRing)}>
              <Avatar className="size-9">
                <AvatarFallback className="rounded-full bg-[oklch(0.19_0.022_275)] text-xs font-bold text-white">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.title ?? ROLE_LABEL[user.role]}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground transition-all duration-200 hover:bg-white/8 hover:text-red-300 active:scale-90"
              onClick={logout}
              aria-label="Log out"
            >
              <LogOut className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------ Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/8 bg-white/[0.03] px-4 backdrop-blur-xl md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile logo */}
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-black tracking-tight md:hidden',
                theme.logoSolid,
              )}
            >
              TB
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={contentKey}
                className="min-w-0"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <h1 className="truncate text-base font-semibold tracking-tight text-foreground">
                  {isCompanyHome ? 'Command Center' : meta.title}
                </h1>
                <p className="truncate text-xs text-muted-foreground">
                  {isCompanyHome ? 'Company-wide recruiting intelligence' : meta.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {/* Mobile nav (icons only) */}
            {!isCompany && (
              <div className="flex items-center gap-1 md:hidden">
                {navItems.map((item) => {
                  const active = section === item.key
                  return (
                    <Button
                      key={item.key}
                      variant="ghost"
                      size="icon"
                      aria-label={item.label}
                      className={cn(
                        'size-9 transition-colors duration-200 active:scale-90',
                        active ? cn(accentClasses[accent].soft, theme.navActiveText) : 'text-muted-foreground hover:bg-white/5',
                      )}
                      onClick={() => setSection(item.key)}
                    >
                      <item.icon className="size-4" aria-hidden />
                    </Button>
                  )
                })}
              </div>
            )}
            {isCompany ? (
              <Badge variant="outline" className="border-violet-400/30 bg-violet-500/10 text-violet-300 shadow-[0_0_16px_-6px] shadow-violet-500/60">
                <Gauge className="size-3" aria-hidden /> Read-only observer
              </Badge>
            ) : (
              <NotificationBell accent={accent} onOpenConversation={openConversation} onOpenEvent={openEvent} />
            )}
            <Badge
              variant="outline"
              className={cn('hidden gap-1.5 border-white/10 bg-white/[0.05] sm:inline-flex', theme.navActiveText)}
            >
              <span className={cn('size-1.5 rounded-full bg-gradient-to-br', theme.gradient)} aria-hidden />
              {ROLE_LABEL[user.role]}
            </Badge>
          </div>
        </header>

        {/* Content */}
        <main className="relative min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <PageTransition sectionKey={contentKey}>{renderSection()}</PageTransition>
        </main>
      </div>
    </div>
  )
}
