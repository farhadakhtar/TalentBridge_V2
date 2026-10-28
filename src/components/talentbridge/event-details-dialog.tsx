'use client'

/**
 * TalentBridge_V2 — read-only dialog showing the details of a selected event.
 * Dark glass-strong panel with gradient title underline.
 */
import { format, parseISO } from 'date-fns'
import { CalendarDays, Clock, Flag, User, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { EventDTO } from '@/lib/types'
import { eventPill, roleTheme, type Accent } from './tb-utils'

interface Props {
  event: EventDTO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  accent?: Accent
}

export function EventDetailsDialog({ event, open, onOpenChange, accent = 'blue' }: Props) {
  const theme = roleTheme[accent]
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-2xl border-white/10 sm:max-w-md">
        {event && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(eventPill(event.type, accent), 'border')}>
                  {event.type}
                </Badge>
                {event.targetUserId && (
                  <Badge variant="outline" className="gap-1 border-white/10 bg-white/[0.04] text-muted-foreground">
                    <Flag className="size-3 text-amber-400" aria-hidden /> For {event.targetUserName}
                  </Badge>
                )}
              </div>
              <DialogTitle className="pt-1 text-lg leading-snug tracking-tight">{event.title}</DialogTitle>
              <span
                aria-hidden
                className={cn('mt-1 block h-0.5 w-12 rounded-full bg-gradient-to-r', theme.gradient)}
              />
              <DialogDescription className="text-muted-foreground">
                Scheduled by {event.creatorName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5">
                <CalendarDays className={cn('size-4', theme.text)} aria-hidden />
                <span className="font-medium">{format(parseISO(event.date), 'EEE, dd MMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className={cn('size-4', theme.text)} aria-hidden />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <User className="size-4 text-muted-foreground" aria-hidden />
                <span>
                  For: <span className="font-medium">{event.targetUserName}</span>
                  {event.targetUserTitle ? (
                    <span className="text-muted-foreground"> · {event.targetUserTitle}</span>
                  ) : null}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <UserRound className="size-4 text-muted-foreground" aria-hidden />
                <span>
                  Created by <span className="font-medium">{event.creatorName}</span>
                </span>
              </div>
              <Separator className="bg-white/8" />
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Notes
                </p>
                <p className="whitespace-pre-wrap rounded-lg border border-white/[0.06] bg-white/[0.04] p-3 text-sm leading-relaxed text-foreground/90">
                  {event.notes || 'No notes for this event.'}
                </p>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.97]"
                >
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
