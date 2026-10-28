'use client'

/**
 * TalentBridge_V2 — seeker-only "Apply to Job" dialog.
 * Lets a candidate submit an optional cover letter with their application.
 * The parent remounts it via key={String(open)} so form state is fresh.
 */
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Loader2, MapPin, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api-client'
import type { JobDTO } from '@/lib/types'
import { useAuthGuard, useAuthErrorEffect } from './auth-context'
import { roleTheme, toastError, toastSuccess } from './tb-utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: JobDTO | null
}

const MAX_COVER = 2000

export function ApplyDialog({ open, onOpenChange, job }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-2xl border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/30">
              <Send className="size-4" aria-hidden />
            </span>
            Apply to this role
          </DialogTitle>
          <span aria-hidden className="block h-0.5 w-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300" />
          <DialogDescription className="text-muted-foreground">
            Submit your application — the recruiter will be notified instantly.
          </DialogDescription>
        </DialogHeader>
        {open && job && <ApplyForm job={job} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function ApplyForm({ job, onDone }: { job: JobDTO; onDone: () => void }) {
  const guard = useAuthGuard()
  const queryClient = useQueryClient()
  const theme = roleTheme.blue

  const [coverLetter, setCoverLetter] = useState('')

  const apply = useMutation({
    mutationFn: (text: string) => api.applyToJob(job.id, { coverLetter: text || undefined }),
    onSuccess: (_data, _text) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toastSuccess('Application sent', `You applied to "${job.title}" at ${job.company}`)
      onDone()
    },
    onError: (err: Error) => {
      guard(err)
      toastError(err.message)
    },
  })

  useAuthErrorEffect(apply.error)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    apply.mutate(coverLetter.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Job summary */}
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
        <p className="truncate text-sm font-semibold text-foreground">{job.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1">
            <Building2 className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{job.company}</span>
          </span>
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{job.location}</span>
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="cover-letter" className="text-muted-foreground">
            Cover letter <span className="text-muted-foreground/60">(optional)</span>
          </Label>
          <span
            className={cn(
              'text-[10px] tabular-nums',
              coverLetter.length > MAX_COVER - 100 ? 'text-amber-300' : 'text-muted-foreground/70',
            )}
          >
            {coverLetter.length}/{MAX_COVER}
          </span>
        </div>
        <Textarea
          id="cover-letter"
          placeholder="Introduce yourself, highlight relevant experience, or note your availability…"
          rows={5}
          className="border-white/10 bg-white/[0.05] focus-visible:ring-blue-400/40"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value.slice(0, MAX_COVER))}
          maxLength={MAX_COVER}
        />
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={apply.isPending}
          className={cn('w-full shine active:scale-[0.98]', theme.solid)}
        >
          <span className="relative z-10 flex items-center gap-2">
            {apply.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            Submit Application
          </span>
        </Button>
      </DialogFooter>
    </form>
  )
}
