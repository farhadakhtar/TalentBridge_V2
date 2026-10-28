'use client'

/**
 * TalentBridge_V2 — recruiter-only "Applicants" dialog.
 * Lists every candidate who applied to one of the recruiter's own postings,
 * with their profile, matched skills, cover letter and a Message shortcut.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, Mail, Mailbox, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api-client'
import type { JobDTO } from '@/lib/types'
import { useAuthGuard, useAuthErrorEffect } from './auth-context'
import { initials, roleTheme, timeAgo, toastError } from './tb-utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: JobDTO | null
  /** Jump to the 1:1 conversation with an applicant. */
  onOpenConversation: (conversationId: string) => void
}

export function ApplicantsDialog({ open, onOpenChange, job, onOpenConversation }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-2xl border-white/10 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30">
              <Users className="size-4" aria-hidden />
            </span>
            Applicants
          </DialogTitle>
          <span aria-hidden className="block h-0.5 w-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" />
          <DialogDescription className="text-muted-foreground">
            {job ? (
              <>
                <span className="text-foreground">{job.title}</span> · {job.company}
              </>
            ) : (
              'Loading…'
            )}
          </DialogDescription>
        </DialogHeader>
        {open && job && (
          <ApplicantsList job={job} onOpenConversation={onOpenConversation} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ApplicantsList({
  job,
  onOpenConversation,
  onDone,
}: {
  job: JobDTO
  onOpenConversation: (conversationId: string) => void
  onDone: () => void
}) {
  const guard = useAuthGuard()
  const queryClient = useQueryClient()
  const theme = roleTheme.emerald

  const applicantsQuery = useQuery({
    queryKey: ['job-applicants', job.id],
    queryFn: () => api.getJobApplicants(job.id),
    enabled: !!job.id,
    refetchInterval: 8000,
  })
  useAuthErrorEffect(applicantsQuery.error)

  const jobSkillKeys = new Set(job.skills.map((s) => s.toLowerCase()))

  const openConversation = useMutation({
    mutationFn: api.openConversation,
    onSuccess: ({ conversation }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      onDone()
      onOpenConversation(conversation.id)
    },
    onError: (err: Error) => {
      guard(err)
      toastError(err.message)
    },
  })

  const applicants = applicantsQuery.data?.applications ?? []

  return (
    <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
      {applicantsQuery.isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />
        ))
      ) : applicants.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full border border-white/8 bg-white/[0.04]">
            <Mailbox className="size-5 text-muted-foreground/60" aria-hidden />
          </span>
          <p className="text-sm font-medium text-foreground">No applicants yet</p>
          <p className="text-xs text-muted-foreground">
            Candidates who apply to this role will appear here.
          </p>
        </div>
      ) : (
        applicants.map((a) => {
          const matched = a.userSkills.filter((s) => jobSkillKeys.has(s.toLowerCase()))
          const others = a.userSkills.filter((s) => !jobSkillKeys.has(s.toLowerCase()))
          const messagePending =
            openConversation.isPending && openConversation.variables === a.userId
          return (
            <div
              key={a.id}
              className="rounded-xl border border-white/8 bg-white/[0.03] p-3 transition-colors duration-200 hover:border-white/12"
            >
              <div className="flex items-start gap-3">
                <span className={cn('shrink-0 rounded-full bg-gradient-to-br p-[2px]', theme.avatarRing)}>
                  <Avatar className="size-9">
                    <AvatarFallback className={cn('rounded-full text-[11px] font-bold', theme.avatarFallback)}>
                      {initials(a.userName)}
                    </AvatarFallback>
                  </Avatar>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{a.userName}</p>
                      {a.userTitle && (
                        <p className="truncate text-xs text-muted-foreground">{a.userTitle}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      Applied {timeAgo(a.createdAt)}
                    </span>
                  </div>

                  {/* Skills — matched first, highlighted */}
                  {(matched.length > 0 || others.length > 0) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {matched.map((s) => (
                        <span
                          key={`m-${s}`}
                          className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300"
                        >
                          <Check className="size-2.5" aria-hidden />
                          {s}
                        </span>
                      ))}
                      {others.slice(0, 6).map((s) => (
                        <span
                          key={`o-${s}`}
                          className="rounded-full border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[10px] text-foreground/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Cover letter */}
                  {a.coverLetter && (
                    <p className="mt-2 line-clamp-3 rounded-lg border border-white/6 bg-white/[0.02] px-2.5 py-2 text-xs italic text-muted-foreground">
                      “{a.coverLetter}”
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-[10px] text-zinc-300">
                      {a.status}
                    </Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1.5 border-white/10 bg-white/[0.04] px-2.5 text-xs hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.97]"
                      disabled={messagePending}
                      onClick={() => openConversation.mutate(a.userId)}
                    >
                      {messagePending ? (
                        <Loader2 className="size-3 animate-spin" aria-hidden />
                      ) : (
                        <Mail className="size-3" aria-hidden />
                      )}
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
