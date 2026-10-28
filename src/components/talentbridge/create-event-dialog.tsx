'use client'

/**
 * TalentBridge_V2 — recruiter-only "Create Event" dialog.
 * Optionally pre-selects the target job seeker. The form remounts on every open,
 * so its state is always fresh without reset effects.
 */
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api-client'
import type { EventType } from '@/lib/types'
import { useAuthGuard } from './auth-context'
import { accentClasses, toastError, toastSuccess } from './tb-utils'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pre-select this job seeker (from the applicant board "Schedule" button). */
  defaultTargetId?: string
}

const EVENT_TYPES: EventType[] = ['Interview', 'Meeting', 'Call']

export function CreateEventDialog({ open, onOpenChange, defaultTargetId }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-2xl border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30">
              <CalendarPlus className="size-4" aria-hidden />
            </span>
            Create Event
          </DialogTitle>
          <span aria-hidden className="block h-0.5 w-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" />
          <DialogDescription className="text-muted-foreground">
            Schedule an interview, meeting or call. The candidate is notified automatically.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <CreateEventForm
            key={`${String(open)}-${defaultTargetId ?? 'any'}`}
            defaultTargetId={defaultTargetId}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function CreateEventForm({
  defaultTargetId,
  onDone,
}: {
  defaultTargetId?: string
  onDone: () => void
}) {
  const guard = useAuthGuard()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState<EventType | ''>('')
  const [notes, setNotes] = useState('')
  const [targetId, setTargetId] = useState(defaultTargetId ?? '')

  const { data: seekerData } = useQuery({
    queryKey: ['users', 'job_seeker'],
    queryFn: () => api.getUsers('job_seeker'),
  })
  const seekers = seekerData?.users ?? []

  const createEvent = useMutation({
    mutationFn: api.createEvent,
    onSuccess: ({ event }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['company-stats'] })
      toastSuccess('Event created', `${event.targetUserName} has been notified`)
      onDone()
    },
    onError: (err: Error) => {
      guard(err)
      toastError(err.message)
    },
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim() || !date || !time || !type || !targetId) {
      toastError('Please fill in all required fields (title, date, time, type and "For whom").')
      return
    }
    createEvent.mutate({
      title: title.trim(),
      date,
      time,
      type,
      notes: notes.trim() || undefined,
      targetUserId: targetId,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ev-title" className="text-muted-foreground">Title *</Label>
        <Input
          id="ev-title"
          placeholder="e.g. Technical Interview — Round 2"
          className="border-white/10 bg-white/[0.05] focus-visible:ring-emerald-400/40"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="ev-date" className="text-muted-foreground">Date *</Label>
          <Input
            id="ev-date"
            type="date"
            className="border-white/10 bg-white/[0.05] focus-visible:ring-emerald-400/40"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ev-time" className="text-muted-foreground">Time *</Label>
          <Input
            id="ev-time"
            type="time"
            className="border-white/10 bg-white/[0.05] focus-visible:ring-emerald-400/40"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="ev-type" className="text-muted-foreground">Type *</Label>
          <Select value={type} onValueChange={(v) => setType(v as EventType)}>
            <SelectTrigger id="ev-type" className="w-full border-white/10 bg-white/[0.05]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="border-white/15 bg-[oklch(0.14_0.02_275/97%)] shadow-2xl shadow-black/50 backdrop-blur-xl">
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ev-target" className="text-muted-foreground">For whom *</Label>
          <Select value={targetId} onValueChange={setTargetId}>
            <SelectTrigger id="ev-target" className="w-full border-white/10 bg-white/[0.05]">
              <SelectValue placeholder="Select candidate" />
            </SelectTrigger>
            <SelectContent className="border-white/15 bg-[oklch(0.14_0.02_275/97%)] shadow-2xl shadow-black/50 backdrop-blur-xl">
              {seekers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ev-notes" className="text-muted-foreground">Notes</Label>
        <Textarea
          id="ev-notes"
          placeholder="Agenda, meeting link, preparation tips…"
          rows={3}
          className="border-white/10 bg-white/[0.05] focus-visible:ring-emerald-400/40"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
        />
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-white/10 bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.97]"
          onClick={onDone}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className={cn('shine active:scale-[0.97]', accentClasses.emerald.solid)}
          disabled={createEvent.isPending}
        >
          <span className="relative z-10 flex items-center gap-2">
            {createEvent.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Create Event
          </span>
        </Button>
      </DialogFooter>
    </form>
  )
}
