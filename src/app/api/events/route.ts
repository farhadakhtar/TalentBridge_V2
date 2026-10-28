/**
 * GET  /api/events — job_seeker: events targeted at them; recruiter/company: all events.
 * POST /api/events — recruiter-only: create event + notify the targeted seeker.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/auth'
import { toEventDTO } from '@/lib/serialize'

export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const eventSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  date: z.string().regex(DATE_RE, 'date must be YYYY-MM-DD'),
  time: z.string().regex(TIME_RE, 'time must be HH:mm (24h)'),
  type: z.enum(['Interview', 'Meeting', 'Call']),
  notes: z.string().trim().max(1000).optional(),
  targetUserId: z.string().min(1, 'targetUserId is required'),
})

/** Strict calendar validity: rejects e.g. 2024-02-31 (plain regex would allow it). */
function isRealDate(date: string): boolean {
  const d = new Date(`${date}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date
}

// GET ---------------------------------------------------------------
export async function GET(req: Request) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const events = await db.calendarEvent.findMany({
      where: auth.role === 'job_seeker' ? { targetUserId: auth.userId } : undefined,
      include: {
        creator: { select: { name: true } },
        targetUser: { select: { name: true, title: true } },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    })

    return NextResponse.json({ events: events.map(toEventDTO) })
  } catch (err) {
    console.error('[events:GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST --------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role !== 'recruiter') {
      return NextResponse.json({ error: 'Only recruiters can schedule events' }, { status: 403 })
    }

    const body: unknown = await req.json().catch(() => null)
    const parsed = eventSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid event payload' },
        { status: 400 }
      )
    }
    const { title, date, time, type, notes, targetUserId } = parsed.data

    if (!isRealDate(date)) {
      return NextResponse.json({ error: 'date must be a valid calendar date (YYYY-MM-DD)' }, { status: 400 })
    }

    const target = await db.user.findUnique({ where: { id: targetUserId } })
    if (!target) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }
    if (target.role !== 'job_seeker') {
      return NextResponse.json({ error: 'targetUserId must be a job seeker' }, { status: 400 })
    }

    const creator = await db.user.findUniqueOrThrow({
      where: { id: auth.userId },
      select: { name: true },
    })

    const event = await db.calendarEvent.create({
      data: {
        title,
        date,
        time,
        type,
        notes: notes || null,
        createdById: auth.userId,
        targetUserId,
      },
      include: {
        creator: { select: { name: true } },
        targetUser: { select: { name: true, title: true } },
      },
    })

    await db.notification.create({
      data: {
        userId: targetUserId,
        type: 'event',
        refId: event.id,
        message: `${creator.name} scheduled "${title}" with you`,
      },
    })

    return NextResponse.json({ event: toEventDTO(event) })
  } catch (err) {
    console.error('[events:POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
