'use client'

/**
 * TalentBridge_V2 — Job Board view (all roles).
 * Seekers see profile-aligned roles pinned first with a gradient hairline +
 * match badge + progress bar, can apply (and withdraw) with an optional cover
 * letter; recruiters can post, delete their own jobs and view applicants;
 * company gets a read-only board. Polls every 8s like the rest of the app.
 */
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Building2,
  Check,
  Loader2,
  MapPin,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Undo2,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api-client'
import type { JobDTO, JobType, SafeUser } from '@/lib/types'
import { useAuthGuard, useAuthErrorEffect } from './auth-context'
import { ApplicantsDialog } from './applicants-dialog'
import { ApplyDialog } from './apply-dialog'
import { PostJobDialog } from './post-job-dialog'
import { initials, roleTheme, timeAgo, toastError, toastSuccess, type Accent } from './tb-utils'
import { EASE, MotionCard, SectionHeading } from './tb-motion'

interface Props {
  user: SafeUser
  accent: Accent
  /** Jump to a 1:1 conversation (used by the recruiter's applicants dialog). */
  onOpenConversation?: (conversationId: string) => void
}

/* ------- Literal class maps (Tailwind needs literals, keyed by accent) ------- */

/** Accent-tinted chip / badge base. */
const ACCENT_CHIP: Record<Accent, string> = {
  blue: 'border-blue-400/30 bg-blue-500/10 text-blue-300',
  emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
  violet: 'border-violet-400/30 bg-violet-500/10 text-violet-300',
}

/** High-preference badge — accent tint + subtle glow. */
const HIGH_BADGE: Record<Accent, string> = {
  blue: 'border-blue-400/30 bg-blue-500/10 text-blue-300 shadow-[0_0_14px_-6px] shadow-blue-500/60',
  emerald:
    'border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_14px_-6px] shadow-emerald-500/60',
  violet:
    'border-violet-400/30 bg-violet-500/10 text-violet-300 shadow-[0_0_14px_-6px] shadow-violet-500/60',
}

/** Gradient hairline border wrapper stops (like the login card). */
const HIGH_WRAPPER: Record<Accent, string> = {
  blue: 'from-blue-400/40 via-white/10 to-white/5',
  emerald: 'from-emerald-400/40 via-white/10 to-white/5',
  violet: 'from-violet-400/40 via-white/10 to-white/5',
}

/** Job type badge — muted glass, with tinted exceptions. */
const TYPE_BADGE: Record<JobType, string> = {
  'Full-time': 'border-white/10 bg-white/[0.05] text-muted-foreground',
  'Part-time': 'border-sky-400/25 bg-sky-500/15 text-sky-300',
  Internship: 'border-amber-400/25 bg-amber-500/15 text-amber-300',
  Contract: 'border-rose-400/25 bg-rose-500/15 text-rose-300',
}

/** Badge copy for high-preference cards. */
function highBadgeLabel(job: JobDTO): string {
  if (job.match.score >= 60) return `Strong match · ${job.match.score}%`
  if (job.match.matchedSkills.length > 0) {
    return `High preference · ${job.match.matchedSkills.length} skill${job.match.matchedSkills.length === 1 ? '' : 's'}`
  }
  return 'Role aligned with your profile'
}

/* --------------------------------- Card ---------------------------------- */

interface JobCardProps {
  job: JobDTO
  accent: Accent
  canDelete: boolean
  isConfirming: boolean
  deletePending: boolean
  onDeleteClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Seeker can apply to this job. */
  canApply: boolean
  /** Recruiter owns this job and can view its applicants. */
  canViewApplicants: boolean
  applyPending: boolean
  withdrawPending: boolean
  onApply: () => void
  onWithdraw: () => void
  onViewApplicants: () => void
}

function JobCard({
  job,
  accent,
  canDelete,
  isConfirming,
  deletePending,
  onDeleteClick,
  canApply,
  canViewApplicants,
  applyPending,
  withdrawPending,
  onApply,
  onWithdraw,
  onViewApplicants,
}: JobCardProps) {
  const theme = roleTheme[accent]
  const isHigh = job.match.high
  const matchedKeys = new Set(job.match.matchedSkills.map((s) => s.toLowerCase()))

  const card = (
    <MotionCard
      accent={accent}
      className={cn('flex h-full flex-col gap-3 p-4', isHigh && 'rounded-2xl')}
    >
      {isHigh && (
        <>
          <div className="flex items-center">
            <Badge
              variant="outline"
              className={cn('gap-1.5 border px-2.5 py-0.5 text-[11px] font-semibold', HIGH_BADGE[accent])}
            >
              <Sparkles className="size-3" aria-hidden />
              {highBadgeLabel(job)}
            </Badge>
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <span>Profile match</span>
              <span className={cn('tabular-nums', theme.text)}>{job.match.score}%</span>
            </div>
            <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className={cn('h-full rounded-full bg-gradient-to-r', theme.gradient)}
                style={{ width: `${Math.max(job.match.score, 8)}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* Title + type */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground" title={job.title}>
          {job.title}
        </h3>
        <Badge variant="outline" className={cn('shrink-0 border text-[10px]', TYPE_BADGE[job.type])}>
          {job.type}
        </Badge>
      </div>

      {/* Company + location */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1">
          <Building2 className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{job.company}</span>
        </span>
        <span className="flex min-w-0 items-center gap-1">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{job.location}</span>
        </span>
      </div>

      {/* Description */}
      <p className="line-clamp-3 text-sm text-muted-foreground">{job.description}</p>

      {/* Skills — matched skills highlighted with a check */}
      <div className="flex flex-wrap gap-1.5">
        {job.skills.map((skill) => {
          const matched = matchedKeys.has(skill.toLowerCase())
          return (
            <span
              key={skill}
              className={cn(
                'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]',
                matched ? ACCENT_CHIP[accent] : 'border-white/8 bg-white/[0.04] text-foreground/70',
              )}
            >
              {matched && <Check className="size-3" aria-hidden />}
              {skill}
            </span>
          )
        })}
      </div>

      {/* Action row — seeker applies / recruiter views applicants */}
      {(canApply || canViewApplicants) && (
        <div className="mt-1">
          {canApply && (
            job.applied ? (
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold',
                    'border-blue-400/30 bg-blue-500/10 text-blue-300',
                  )}
                >
                  <Check className="size-3.5" aria-hidden /> Applied
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0 gap-1 px-2.5 text-xs text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-300 active:scale-95"
                  disabled={withdrawPending}
                  onClick={(e) => {
                    e.stopPropagation()
                    onWithdraw()
                  }}
                >
                  {withdrawPending ? (
                    <Loader2 className="size-3 animate-spin" aria-hidden />
                  ) : (
                    <Undo2 className="size-3" aria-hidden />
                  )}
                  Withdraw
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                className={cn('w-full gap-2 shine active:scale-[0.98]', theme.solid)}
                disabled={applyPending}
                onClick={(e) => {
                  e.stopPropagation()
                  onApply()
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {applyPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="size-4" aria-hidden />
                  )}
                  Apply
                </span>
              </Button>
            )
          )}
          {canViewApplicants && (
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-white/10 bg-white/[0.04] text-foreground hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]"
              onClick={(e) => {
                e.stopPropagation()
                onViewApplicants()
              }}
            >
              <Users className="size-4" aria-hidden />
              {job.applicantCount} Applicant{job.applicantCount === 1 ? '' : 's'}
            </Button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center gap-2.5 border-t border-white/8 pt-3">
        <span className={cn('shrink-0 rounded-full bg-gradient-to-br p-[2px]', theme.avatarRing)}>
          <Avatar className="size-7">
            <AvatarFallback className="rounded-full bg-[oklch(0.19_0.022_275)] text-[10px] font-bold text-white">
              {initials(job.postedByName)}
            </AvatarFallback>
          </Avatar>
        </span>
        <p className="min-w-0 flex-1 truncate text-xs">
          <span className="text-foreground">Posted by {job.postedByName}</span>
          <span className="text-muted-foreground"> · {timeAgo(job.createdAt)}</span>
        </p>
        {canDelete && (
          <>
            {isConfirming && (
              <span className="shrink-0 text-[10px] font-medium text-red-300">Click again</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground transition-colors duration-200 hover:bg-red-500/10 hover:text-red-300 active:scale-90"
              aria-label={
                isConfirming ? 'Click again to confirm delete' : `Delete job: ${job.title}`
              }
              disabled={deletePending}
              onClick={onDeleteClick}
            >
              <Trash2 className="size-3.5" aria-hidden />
            </Button>
          </>
        )}
      </div>
    </MotionCard>
  )

  if (!isHigh) return card
  return (
    <div className={cn('h-full rounded-2xl bg-gradient-to-b p-px', HIGH_WRAPPER[accent])}>
      {card}
    </div>
  )
}

/* --------------------------------- View ---------------------------------- */

export function JobsView({ user, accent, onOpenConversation }: Props) {
  const guard = useAuthGuard()
  const queryClient = useQueryClient()
  const theme = roleTheme[accent]

  const [postOpen, setPostOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [applyJob, setApplyJob] = useState<JobDTO | null>(null)
  const [applicantsJob, setApplicantsJob] = useState<JobDTO | null>(null)

  const jobsQuery = useQuery({ queryKey: ['jobs'], queryFn: api.getJobs, refetchInterval: 8000 })
  useAuthErrorEffect(jobsQuery.error)

  const jobs = jobsQuery.data?.jobs ?? []
  const isSeeker = user.role === 'job_seeker'
  const isRecruiter = user.role === 'recruiter'

  const highJobs = isSeeker ? jobs.filter((j) => j.match.high) : []
  const highCount = highJobs.length
  const total = jobs.length

  /** Up to 6 unique matched skills across high-preference jobs (strip preview). */
  const stripSkills: string[] = []
  if (highCount > 0) {
    const seen = new Set<string>()
    for (const j of highJobs) {
      for (const s of j.match.matchedSkills) {
        const key = s.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        stripSkills.push(s)
        if (stripSkills.length === 6) break
      }
      if (stripSkills.length === 6) break
    }
  }

  const deleteJob = useMutation({
    mutationFn: api.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      setConfirmId(null)
      toastSuccess('Job removed', 'The posting is no longer visible on any job board')
    },
    onError: (err: Error) => {
      guard(err)
      toastError(err.message)
    },
  })

  const withdraw = useMutation({
    mutationFn: (jobId: string) => api.withdrawApplication(jobId),
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      const job = jobs.find((j) => j.id === jobId)
      toastSuccess('Application withdrawn', job ? `You withdrew from "${job.title}"` : undefined)
    },
    onError: (err: Error) => {
      guard(err)
      toastError(err.message)
    },
  })

  function handleDeleteClick(jobId: string, event: React.MouseEvent<HTMLButtonElement>) {
    // Keep the card-level "clear confirm" handler from firing.
    event.stopPropagation()
    if (confirmId !== jobId) {
      setConfirmId(jobId)
      return
    }
    deleteJob.mutate(jobId)
  }

  const description = isRecruiter
    ? 'Post a role, then track every candidate who applies.'
    : user.role === 'company'
      ? 'Read-only view of every posting published by recruiters.'
      : highCount > 0
        ? `${highCount} of ${total} roles align with your profile — they're pinned to the top.`
        : 'No openings align with your profile yet — check back soon.'

  return (
    <section aria-label="Job Board" className="space-y-5">
      <SectionHeading
        accent={accent}
        eyebrow="Job Board"
        title={
          <>
            Open <span className={theme.gradientText}>roles</span>
          </>
        }
        description={description}
        right={
          isRecruiter ? (
            <Button
              onClick={() => setPostOpen(true)}
              className={cn('h-10 gap-2 px-4 text-sm font-semibold shine active:scale-[0.98]', theme.solid)}
            >
              <Plus className="size-4" aria-hidden /> Post a Job
            </Button>
          ) : undefined
        }
      />

      {/* Seeker alignment strip */}
      {isSeeker && highCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 backdrop-blur-xl">
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-lg',
              theme.gradient,
              theme.glow,
            )}
          >
            <Sparkles className="size-4" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{highCount}</span> of {total} roles align
            with your profile
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {stripSkills.map((skill) => (
              <span
                key={skill}
                className={cn('rounded-full border px-2.5 py-0.5 text-xs', ACCENT_CHIP[accent])}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cards */}
      {jobsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl bg-white/5" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-16 text-center backdrop-blur-xl">
          <span className="flex size-14 items-center justify-center rounded-full border border-white/8 bg-white/[0.04]">
            <Briefcase className="size-6 text-muted-foreground/60" aria-hidden />
          </span>
          <p className="text-sm font-medium text-foreground">No jobs posted yet</p>
          {isRecruiter && (
            <p className="text-xs text-muted-foreground">Post the first role to get started.</p>
          )}
        </div>
      ) : (
        /* NOTE: self-contained mount animation per card (NOT a parent-driven
           StaggerGroup) — jobs can appear mid-session (posted live or picked up
           by polling) and late-mounted children of an already-shown stagger
           parent would stay stuck at opacity 0. `layout` reflows the grid when
           a card is deleted. */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: Math.min(index * 0.06, 0.36) }}
              className="h-full"
              onClick={() => setConfirmId(null)}
            >
              <JobCard
                job={job}
                accent={accent}
                canDelete={isRecruiter && job.postedById === user.id}
                isConfirming={confirmId === job.id}
                deletePending={deleteJob.isPending && deleteJob.variables === job.id}
                onDeleteClick={(event) => handleDeleteClick(job.id, event)}
                canApply={isSeeker}
                canViewApplicants={isRecruiter && job.postedById === user.id}
                applyPending={false}
                withdrawPending={withdraw.isPending && withdraw.variables === job.id}
                onApply={() => setApplyJob(job)}
                onWithdraw={() => withdraw.mutate(job.id)}
                onViewApplicants={() => setApplicantsJob(job)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <PostJobDialog key={String(postOpen)} open={postOpen} onOpenChange={setPostOpen} />
      <ApplyDialog key={`apply-${applyJob?.id ?? 'none'}`} open={!!applyJob} onOpenChange={(o) => !o && setApplyJob(null)} job={applyJob} />
      <ApplicantsDialog
        key={`apps-${applicantsJob?.id ?? 'none'}`}
        open={!!applicantsJob}
        onOpenChange={(o) => !o && setApplicantsJob(null)}
        job={applicantsJob}
        onOpenConversation={onOpenConversation ?? (() => {})}
      />
    </section>
  )
}
