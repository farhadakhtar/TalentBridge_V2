'use client'

/**
 * TalentBridge_V2 — recruiter-only "Post a Job" dialog.
 * The parent remounts it via key={String(open)}, so form state is always
 * fresh on every open without any reset effects. Skills are parsed live
 * from a comma-separated input with an instant chip preview.
 */
import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
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
import type { JobType } from '@/lib/types'
import { useAuthGuard } from './auth-context'
import { roleTheme, toastError, toastSuccess } from './tb-utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Internship', 'Contract']

export function PostJobDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-2xl border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30">
              <Plus className="size-4" aria-hidden />
            </span>
            Post a Job
          </DialogTitle>
          <span aria-hidden className="block h-0.5 w-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" />
          <DialogDescription className="text-muted-foreground">
            Every candidate will see this on their Job Board instantly.
          </DialogDescription>
        </DialogHeader>
        {open && <PostJobForm onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function PostJobForm({ onDone }: { onDone: () => void }) {
  const guard = useAuthGuard()
  const queryClient = useQueryClient()
  const theme = roleTheme.emerald

  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState<JobType>('Full-time')
  const [description, setDescription] = useState('')
  const [skillsInput, setSkillsInput] = useState('')

  /** Comma-separated input → trimmed, case-insensitively deduped skill list. */
  const parsedSkills = useMemo(() => {
    const seen = new Set<string>()
    const list: string[] = []
    for (const raw of skillsInput.split(',')) {
      const skill = raw.trim()
      const key = skill.toLowerCase()
      if (!skill || seen.has(key)) continue
      seen.add(key)
      list.push(skill)
    }
    return list
  }, [skillsInput])

  const createJob = useMutation({
    mutationFn: api.createJob,
    onSuccess: ({ job }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toastSuccess('Job posted', `"${job.title}" is now live on the job board`)
      onDone()
    },
    onError: (err: Error) => {
      guard(err)
      toastError(err.message)
    },
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (title.trim().length < 3) {
      toastError('Title must be at least 3 characters')
      return
    }
    if (company.trim().length < 2) {
      toastError('Company must be at least 2 characters')
      return
    }
    if (location.trim().length < 2) {
      toastError('Location must be at least 2 characters')
      return
    }
    if (description.trim().length < 2) {
      toastError('Description must be at least 2 characters')
      return
    }
    if (parsedSkills.length < 1) {
      toastError('Add at least one required skill')
      return
    }
    createJob.mutate({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      type,
      description: description.trim(),
      skills: parsedSkills,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="job-title" className="text-muted-foreground">Title *</Label>
        <Input
          id="job-title"
          placeholder="e.g. Senior Frontend Engineer"
          className="border-white/10 bg-white/[0.05] focus-visible:ring-emerald-400/40"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="job-company" className="text-muted-foreground">Company *</Label>
          <Input
            id="job-company"
            placeholder="e.g. TalentBridge Labs"
            className="border-white/10 bg-white/[0.05] focus-visible:ring-emerald-400/40"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            maxLength={80}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-location" className="text-muted-foreground">Location *</Label>
          <Input
            id="job-location"
            placeholder="e.g. Remote · Bengaluru"
            className="border-white/10 bg-white/[0.05] focus-visible:ring-emerald-400/40"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={80}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="job-type" className="text-muted-foreground">Type *</Label>
        <Select value={type} onValueChange={(v) => setType(v as JobType)}>
          <SelectTrigger id="job-type" className="w-full border-white/10 bg-white/[0.05]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="border-white/15 bg-[oklch(0.14_0.02_275/97%)] shadow-2xl shadow-black/50 backdrop-blur-xl">
            {JOB_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="job-description" className="text-muted-foreground">Description *</Label>
          <span
            className={cn(
              'text-[10px] tabular-nums',
              description.trim().length > 0 && description.trim().length < 2
                ? 'text-amber-300'
                : description.length > 1900
                  ? 'text-amber-300'
                  : 'text-muted-foreground/70',
            )}
          >
            {description.length}/2000 · min 2
          </span>
        </div>
        <Textarea
          id="job-description"
          placeholder="What the role involves, expectations, benefits…"
          rows={4}
          className="border-white/10 bg-white/[0.05] focus-visible:ring-emerald-400/40"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="job-skills" className="text-muted-foreground">Skills *</Label>
        <Input
          id="job-skills"
          placeholder="React, TypeScript, Next.js"
          className="border-white/10 bg-white/[0.05] focus-visible:ring-emerald-400/40"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          maxLength={300}
        />
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {parsedSkills.length > 0 ? (
            <>
              {parsedSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300"
                >
                  {skill}
                </span>
              ))}
              <span className="text-[10px] text-muted-foreground">
                {parsedSkills.length} skill{parsedSkills.length === 1 ? '' : 's'}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground">
              Comma-separated, e.g. React, TypeScript, Next.js
            </span>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={createJob.isPending}
          className={cn('w-full shine active:scale-[0.98]', theme.solid)}
        >
          <span className="relative z-10 flex items-center gap-2">
            {createJob.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="size-4" aria-hidden />
            )}
            Post a Job
          </span>
        </Button>
      </DialogFooter>
    </form>
  )
}
