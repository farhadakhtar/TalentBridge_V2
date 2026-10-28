/**
 * TalentBridge_V2 — shared frontend helpers (pure functions, no React).
 * Dark "masterpiece" accent system: blue (seeker), emerald (recruiter),
 * violet (company). All class strings stay literal for Tailwind's compiler.
 */
import { format, formatDistanceToNowStrict, parseISO } from 'date-fns'
import { toast } from '@/hooks/use-toast'

/** Initials from a full name ("Nikhil Verma" → "NV"). */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

/** "3 min ago" style relative time. Safe on bad input. */
export function timeAgo(iso: string): string {
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true })
  } catch {
    return ''
  }
}

/** Formatted absolute timestamp for tables / dialogs. */
export function formatDateTime(iso: string): string {
  try {
    return format(parseISO(iso), 'dd MMM yyyy, HH:mm')
  } catch {
    return iso
  }
}

/** Today's date as YYYY-MM-DD (safe comparisons with EventDTO.date). */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Toast an API failure. */
export function toastError(description?: string) {
  toast({
    title: 'Failed',
    description: description || 'Something went wrong. Please try again.',
    variant: 'destructive',
    className: 'glass-destructive backdrop-blur-xl',
  })
}

/** Success toast with glass styling. */
export function toastSuccess(title: string, description?: string) {
  toast({
    title,
    description,
    className: 'glass-strong backdrop-blur-xl border-emerald-400/25',
  })
}

export type Accent = 'blue' | 'emerald' | 'violet'

/**
 * Role accent utilities — dark equivalents (gradient solids, glass tints,
 * glow shadows). Keys consumed across shells, chat, calendar & dashboards.
 */
export const accentClasses: Record<
  Accent,
  {
    solid: string
    solidStatic: string
    gradientText: string
    gradient: string
    text: string
    soft: string
    softText: string
    border: string
    tintRow: string
    ring: string
    glow: string
    bar: string
  }
> = {
  blue: {
    solid: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25 hover:from-blue-400 hover:to-cyan-300',
    solidStatic: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white',
    gradientText: 'bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent',
    gradient: 'from-blue-500 to-cyan-400',
    text: 'text-blue-400',
    soft: 'bg-blue-500/15',
    softText: 'text-blue-300',
    border: 'border-blue-400/40',
    tintRow: 'bg-blue-500/10',
    ring: 'ring-blue-400/60',
    glow: 'shadow-[0_0_28px_-6px] shadow-blue-500/50',
    bar: 'from-blue-400 to-cyan-300',
  },
  emerald: {
    solid: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-300',
    solidStatic: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white',
    gradientText: 'bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent',
    gradient: 'from-emerald-500 to-teal-400',
    text: 'text-emerald-400',
    soft: 'bg-emerald-500/15',
    softText: 'text-emerald-300',
    border: 'border-emerald-400/40',
    tintRow: 'bg-emerald-500/10',
    ring: 'ring-emerald-400/60',
    glow: 'shadow-[0_0_28px_-6px] shadow-emerald-500/50',
    bar: 'from-emerald-400 to-teal-300',
  },
  violet: {
    solid: 'bg-gradient-to-r from-violet-500 to-fuchsia-400 text-white shadow-lg shadow-violet-500/25 hover:from-violet-400 hover:to-fuchsia-300',
    solidStatic: 'bg-gradient-to-r from-violet-500 to-fuchsia-400 text-white',
    gradientText: 'bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-transparent',
    gradient: 'from-violet-500 to-fuchsia-400',
    text: 'text-violet-400',
    soft: 'bg-violet-500/15',
    softText: 'text-violet-300',
    border: 'border-violet-400/40',
    tintRow: 'bg-violet-500/10',
    ring: 'ring-violet-400/60',
    glow: 'shadow-[0_0_28px_-6px] shadow-violet-500/50',
    bar: 'from-violet-400 to-fuchsia-300',
  },
}

/**
 * Shared role theme consumed by shells: sidebar tint, glow shadow colors,
 * gradient stops, active-pill fills. Everything literal for the compiler.
 */
export const roleTheme: Record<
  Accent,
  {
    text: string
    gradient: string
    gradientSoft: string
    gradientText: string
    logoSolid: string
    sidebarTint: string
    activePill: string
    activeEdge: string
    navActiveText: string
    badge: string
    avatarRing: string
    avatarFallback: string
    cardGlowHover: string
    chipHover: string
    todayRing: string
    todayChip: string
    glow: string
    solid: string
  }
> = {
  blue: {
    text: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-400',
    gradientSoft: 'from-blue-500/20 to-cyan-400/10',
    gradientText: 'bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent',
    logoSolid: 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-[0_0_22px_-2px] shadow-blue-500/50',
    sidebarTint: 'bg-[radial-gradient(28rem_10rem_at_18%_0%,oklch(0.62_0.18_255/0.16),transparent_70%)]',
    activePill: 'from-blue-500/20 to-cyan-400/10',
    activeEdge: 'from-blue-400 to-cyan-300',
    navActiveText: 'text-blue-300',
    badge: 'border-blue-400/30 bg-blue-500/10 text-blue-300',
    avatarRing: 'from-blue-400 to-cyan-300',
    avatarFallback: 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white',
    cardGlowHover: 'hover:shadow-[0_10px_44px_-14px] hover:shadow-blue-500/25 hover:border-blue-400/25',
    chipHover: 'hover:border-blue-400/40 hover:shadow-[0_0_20px_-8px] hover:shadow-blue-500/50',
    todayRing: 'ring-2 ring-blue-400/60',
    todayChip: 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/40',
    glow: 'shadow-blue-500/25',
    solid: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25 hover:from-blue-400 hover:to-cyan-300',
  },
  emerald: {
    text: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-400',
    gradientSoft: 'from-emerald-500/20 to-teal-400/10',
    gradientText: 'bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent',
    logoSolid: 'bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-[0_0_22px_-2px] shadow-emerald-500/50',
    sidebarTint: 'bg-[radial-gradient(28rem_10rem_at_18%_0%,oklch(0.68_0.15_162/0.15),transparent_70%)]',
    activePill: 'from-emerald-500/20 to-teal-400/10',
    activeEdge: 'from-emerald-400 to-teal-300',
    navActiveText: 'text-emerald-300',
    badge: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
    avatarRing: 'from-emerald-400 to-teal-300',
    avatarFallback: 'bg-gradient-to-br from-emerald-500 to-teal-400 text-white',
    cardGlowHover: 'hover:shadow-[0_10px_44px_-14px] hover:shadow-emerald-500/25 hover:border-emerald-400/25',
    chipHover: 'hover:border-emerald-400/40 hover:shadow-[0_0_20px_-8px] hover:shadow-emerald-500/50',
    todayRing: 'ring-2 ring-emerald-400/60',
    todayChip: 'bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/40',
    glow: 'shadow-emerald-500/25',
    solid: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-300',
  },
  violet: {
    text: 'text-violet-400',
    gradient: 'from-violet-500 to-fuchsia-400',
    gradientSoft: 'from-violet-500/20 to-fuchsia-400/10',
    gradientText: 'bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-transparent',
    logoSolid: 'bg-gradient-to-br from-violet-500 to-fuchsia-400 text-white shadow-[0_0_22px_-2px] shadow-violet-500/50',
    sidebarTint: 'bg-[radial-gradient(28rem_10rem_at_18%_0%,oklch(0.6_0.21_300/0.17),transparent_70%)]',
    activePill: 'from-violet-500/20 to-fuchsia-400/10',
    activeEdge: 'from-violet-400 to-fuchsia-300',
    navActiveText: 'text-violet-300',
    badge: 'border-violet-400/30 bg-violet-500/10 text-violet-300',
    avatarRing: 'from-violet-400 to-fuchsia-300',
    avatarFallback: 'bg-gradient-to-br from-violet-500 to-fuchsia-400 text-white',
    cardGlowHover: 'hover:shadow-[0_10px_44px_-14px] hover:shadow-violet-500/25 hover:border-violet-400/25',
    chipHover: 'hover:border-violet-400/40 hover:shadow-[0_0_20px_-8px] hover:shadow-violet-500/50',
    todayRing: 'ring-2 ring-violet-400/60',
    todayChip: 'bg-gradient-to-br from-violet-500 to-fuchsia-400 text-white shadow-md shadow-violet-500/40',
    glow: 'shadow-violet-500/25',
    solid: 'bg-gradient-to-r from-violet-500 to-fuchsia-400 text-white shadow-lg shadow-violet-500/25 hover:from-violet-400 hover:to-fuchsia-300',
  },
}

/** Application status badge classes — dark glass + glow. */
export const statusBadge: Record<string, string> = {
  Applied: 'border-white/12 bg-white/5 text-zinc-300',
  Interview: 'border-blue-400/30 bg-blue-500/10 text-blue-300 shadow-[0_0_16px_-6px] shadow-blue-500/60',
  Offer: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_16px_-6px] shadow-emerald-500/60',
}

/** Calendar event type pill classes per accent — dark glow tints. */
export function eventPill(type: string, accent: Accent): string {
  if (type === 'Interview') {
    if (accent === 'blue') return 'border-blue-400/25 bg-blue-500/15 text-blue-300 shadow-[0_0_14px_-6px] shadow-blue-500/60'
    if (accent === 'emerald') return 'border-emerald-400/25 bg-emerald-500/15 text-emerald-300 shadow-[0_0_14px_-6px] shadow-emerald-500/60'
    return 'border-violet-400/25 bg-violet-500/15 text-violet-300 shadow-[0_0_14px_-6px] shadow-violet-500/60'
  }
  if (type === 'Meeting') return 'border-amber-400/25 bg-amber-500/15 text-amber-300 shadow-[0_0_14px_-6px] shadow-amber-500/60'
  if (type === 'Call') return 'border-sky-400/25 bg-sky-500/15 text-sky-300 shadow-[0_0_14px_-6px] shadow-sky-500/60'
  return 'border-white/10 bg-white/5 text-muted-foreground'
}
