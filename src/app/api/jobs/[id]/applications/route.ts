/**
 * GET /api/jobs/[id]/applications — recruiter-only: list every applicant for
 * one of their own postings, newest first. Each row carries the applicant's
 * public profile (name, title, skills) so the recruiter can act on it.
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/auth'
import { toApplicationDTO } from '@/lib/serialize'
import type { ApplicationDTO } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role !== 'recruiter') {
      return NextResponse.json(
        { error: 'Only recruiters can view applicants' },
        { status: 403 }
      )
    }

    const { id: jobId } = await params
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { postedById: true, title: true },
    })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    if (job.postedById !== auth.userId) {
      return NextResponse.json(
        { error: 'You can only view applicants for your own postings' },
        { status: 403 }
      )
    }

    const applications = await db.application.findMany({
      where: { jobId },
      include: {
        job: { select: { title: true } },
        user: { select: { name: true, title: true, skills: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const dtos: ApplicationDTO[] = applications.map(toApplicationDTO)
    return NextResponse.json({ applications: dtos, jobTitle: job.title })
  } catch (err) {
    console.error('[jobs/applications:GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
