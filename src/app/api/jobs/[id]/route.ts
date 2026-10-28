/**
 * DELETE /api/jobs/[id] — recruiter-only: remove one of their own postings.
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role !== 'recruiter') {
      return NextResponse.json({ error: 'Only recruiters can delete jobs' }, { status: 403 })
    }

    const { id } = await params
    const job = await db.job.findUnique({ where: { id }, select: { postedById: true } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    if (job.postedById !== auth.userId) {
      return NextResponse.json({ error: 'You can only delete your own postings' }, { status: 403 })
    }

    await db.job.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[jobs:DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
