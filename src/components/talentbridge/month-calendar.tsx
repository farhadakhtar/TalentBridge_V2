'use client'

/**
 * TalentBridge_V2 — custom month calendar grid (no calendar library).
 * Dark luxury styling: gradient month title, glass nav buttons, directional
 * AnimatePresence slide, hairline cells, glow event pills.
 */
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { EventDTO } from '@/lib/types'
import { cn } from '@/lib/utils'
import { eventPill, roleTheme, type Accent } from './tb-utils'

interface Props {
  events: EventDTO[]
  accent: Accent
  onSelectEvent: (event: EventDTO) => void
  /** Events targeted at this user get a flag marker (e.g. the logged-in job seeker). */
  highlightUserId?: string
  /** Optional action rendered in the calendar header (e.g. recruiter "Create Event"). */
  headerAction?: React.ReactNode
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function MonthCalendar({ events, accent, onSelectEvent, highlightUserId, headerAction }: Props) {
  const [month, setMonth] = useState<Date>(new Date())
  const [dir, setDir] = useState(0)
  const theme = roleTheme[accent]

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month)),
        end: endOfWeek(endOfMonth(month)),
      }),
    [month],
  )

  const byDate = useMemo(() => {
    const map = new Map<string, EventDTO[]>()
    for (const e of events) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    return map
  }, [events])

  function shift(delta: number) {
    setDir(delta)
    setMonth((m) => startOfMonth(new Date(m.getFullYear(), m.getMonth() + delta, 1)))
  }

  function goToday() {
    setDir(0)
    setMonth(new Date())
  }

  const navBtn =
    'border-white/10 bg-white/[0.04] text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-foreground active:translate-y-0 active:scale-95'

  return (
    <div className="glass overflow-hidden rounded-xl shadow-[0_18px_60px_-24px_oklch(0_0_0/60%)]">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/8 px-4 py-3">
        <Button variant="ghost" size="icon" className={navBtn} aria-label="Previous month" onClick={() => shift(-1)}>
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        <Button variant="ghost" size="icon" className={navBtn} aria-label="Next month" onClick={() => shift(1)}>
          <ChevronRight className="size-4" aria-hidden />
        </Button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.h2
            key={format(month, 'yyyy-MM')}
            initial={{ opacity: 0, y: dir === 0 ? 0 : dir * 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dir === 0 ? 0 : -dir * 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn('min-w-36 text-center text-base font-semibold tracking-tight', theme.gradientText)}
          >
            {format(month, 'MMMM yyyy')}
          </motion.h2>
        </AnimatePresence>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-8 border-white/10 bg-white/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08]', theme.navActiveText)}
          onClick={goToday}
        >
          Today
        </Button>
        {headerAction && <div className="ml-auto">{headerAction}</div>}
      </div>

      {/* Grid (horizontally scrollable on very small screens) */}
      <div className="overflow-x-auto p-3">
        <div className="min-w-[640px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={format(month, 'yyyy-MM')}
              initial={{ opacity: 0, x: dir === 0 ? 0 : dir * 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir === 0 ? 0 : -dir * 48 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="grid grid-cols-7 gap-1.5 pb-1.5">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="py-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {days.map((day) => {
                  const key = format(day, 'yyyy-MM-dd')
                  const dayEvents = byDate.get(key) ?? []
                  const inMonth = isSameMonth(day, month)
                  const flagged = highlightUserId
                    ? dayEvents.some((e) => e.targetUserId === highlightUserId)
                    : false
                  const todayCell = isToday(day)
                  return (
                    <div
                      key={key}
                      className={cn(
                        'min-h-24 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1.5 transition-colors duration-200 hover:border-white/12 hover:bg-white/[0.05] md:min-h-28',
                        !inMonth && 'opacity-30',
                        todayCell && theme.todayRing,
                      )}
                    >
                      <div className="flex items-center justify-between px-0.5">
                        <span
                          className={cn(
                            'flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                            todayCell
                              ? theme.todayChip
                              : inMonth
                                ? 'text-foreground'
                                : 'text-muted-foreground/60',
                          )}
                        >
                          {format(day, 'd')}
                        </span>
                        {flagged && (
                          <Flag className="size-3 text-amber-400" aria-label="Your event" />
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 3).map((e) => (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => onSelectEvent(e)}
                            className={cn(
                              'block w-full truncate rounded-md border px-1.5 py-0.5 text-left text-[10px] font-medium transition-all duration-200 hover:scale-[1.03] hover:brightness-110 active:scale-100',
                              eventPill(e.type, accent),
                            )}
                            title={`${e.title} · ${e.time}`}
                          >
                            {e.time} {e.title}
                          </button>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="px-1.5 text-[10px] text-muted-foreground">
                            +{dayEvents.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/** Helper used by list views to format an EventDTO date. */
export function eventDateLabel(date: string): string {
  try {
    return format(parseISO(date), 'EEE, dd MMM yyyy')
  } catch {
    return date
  }
}

export { isSameDay }
