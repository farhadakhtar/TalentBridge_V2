/**
 * GET  /api/jobs — every authenticated user can browse all job postings.
 *      Each job carries a viewer-specific `match` (skill overlap + title
 *      alignment). High-preference jobs are returned FIRST, ranked by score.
 * POST /api/jobs — recruiter-only: publish a new job posting.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/auth'
import { computeJobMatch } from '@/lib/job-match'
import { parseSkills, safeUserSelect, toJobDTO } from '@/lib/serialize'
import type { JobDTO } from '@/lib/types'

export const dynamic = 'force-dynamic'

const jobSchema = z.object({
  title: z.string().trim().min(3, 'Title is required (min 3 chars)').max(120),
  company: z.string().trim().min(2, 'Company is required').max(80),
  location: z.string().trim().min(2, 'Location is required').max(80),
  type: z.enum(['Full-time', 'Part-time', 'Internship', 'Contract']),
  description: z
    .string()
    .trim()
    .min(2, 'Description must be at least 2 characters')
    .max(2000),
  skills: z
    .array(z.string().trim().min(1, 'Skills cannot be empty').max(40))
    .min(1, 'Add at least one required skill')
    .max(12, 'At most 12 skills'),
})

// GET ---------------------------------------------------------------
export async function GET(req: Request) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [viewer, jobs, applications] = await Promise.all([
      db.user.findUnique({ where: { id: auth.userId }, select: safeUserSelect }),
      db.job.findMany({
        include: { postedBy: { select: { name: true, title: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      // Only seekers can apply, so we only need this viewer's applications.
      db.application.findMany({
        where: { userId: auth.userId },
        select: { jobId: true },
      }),
    ])

    const viewerSkills = parseSkills(viewer?.skills ?? null)
    const viewerTitle = viewer?.title ?? null
    const appliedJobIds = new Set(applications.map((a) => a.jobId))

    // Count applicants per job in one pass.
    const applicantCounts = await db.application.groupBy({
      by: ['jobId'],
      _count: { _all: true },
    })
    const countByJob = new Map(applicantCounts.map((c) => [c.jobId, c._count._all]))

    const dtos: JobDTO[] = jobs.map((j) =>
      toJobDTO(
        j,
        computeJobMatch(j.skills, j.title, viewerSkills, viewerTitle),
        appliedJobIds.has(j.id),
        countByJob.get(j.id) ?? 0
      )
    )

    // High preference first: stronger skill overlap → title-aligned → newest.
    dtos.sort((a, b) => {
      if (a.match.high !== b.match.high) return a.match.high ? -1 : 1
      if (a.match.score !== b.match.score) return b.match.score - a.match.score
      return b.createdAt.localeCompare(a.createdAt)
    })

    return NextResponse.json({ jobs: dtos })
  } catch (err) {
    console.error('[jobs:GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST --------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role !== 'recruiter') {
      return NextResponse.json({ error: 'Only recruiters can post jobs' }, { status: 403 })
    }

    const body: unknown = await req.json().catch(() => null)
    const parsed = jobSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid job payload' },
        { status: 400 }
      )
    }
    const { title, company, location, type, description, skills } = parsed.data

    // Dedupe skills case-insensitively while preserving first-seen order.
    const seen = new Set<string>()
    const cleanSkills = skills.filter((s) => {
      const key = s.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const job = await db.job.create({
      data: {
        title,
        company,
        location,
        type,
        description,
        skills: JSON.stringify(cleanSkills),
        postedById: auth.userId,
      },
      include: { postedBy: { select: { name: true, title: true } } },
    })

    return NextResponse.json({
      job: toJobDTO(job, computeJobMatch(job.skills, job.title, cleanSkills, null)),
    })
  } catch (err) {
    console.error('[jobs:POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
