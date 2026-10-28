/**
 * POST   /api/jobs/[id]/apply — job seeker applies to a job (optional cover letter).
 * DELETE /api/jobs/[id]/apply — the same seeker withdraws their application.
 * Recruiters and company users cannot apply. A seeker can apply at most once
 * per job (enforced by the @@unique([jobId, userId]) constraint).
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const applySchema = z.object({
  coverLetter: z.string().trim().max(2000).optional().or(z.literal('')),
})

// POST -----------------------------------------------------------------
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role !== 'job_seeker') {
      return NextResponse.json(
        { error: 'Only job seekers can apply to jobs' },
        { status: 403 }
      )
    }

    const { id: jobId } = await params
    const job = await db.job.findUnique({ where: { id: jobId }, select: { id: true } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const body: unknown = await req.json().catch(() => ({}))
    const parsed = applySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid application payload' },
        { status: 400 }
      )
    }
    const coverLetter = parsed.data.coverLetter?.trim() || null

    // Idempotent: if the seeker already applied, just return that application.
    const existing = await db.application.findUnique({
      where: { jobId_userId: { jobId, userId: auth.userId } },
    })
    if (existing) {
      return NextResponse.json({ application: existing, alreadyApplied: true })
    }

    const application = await db.application.create({
      data: { jobId, userId: auth.userId, coverLetter },
    })

    return NextResponse.json({ application, alreadyApplied: false })
  } catch (err) {
    console.error('[jobs/apply:POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE ---------------------------------------------------------------
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role !== 'job_seeker') {
      return NextResponse.json(
        { error: 'Only job seekers can withdraw applications' },
        { status: 403 }
      )
    }

    const { id: jobId } = await params
    await db.application.deleteMany({
      where: { jobId, userId: auth.userId },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[jobs/apply:DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
