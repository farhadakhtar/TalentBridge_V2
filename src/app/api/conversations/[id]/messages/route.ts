/**
 * GET  /api/conversations/[id]/messages — history (asc) + marks incoming messages read.
 * POST /api/conversations/[id]/messages — {text} → new message + DM notification for the other participant.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/auth'
import { safeUserSelect, toMessageDTO, truncate } from '@/lib/serialize'

export const dynamic = 'force-dynamic'

const sendSchema = z.object({
  text: z.string().trim().min(1, 'Message text is required').max(4000),
})

/** Load the conversation and enforce that the auth user is one of the 2 participants. */
async function requireParticipant(conversationId: string, userId: string) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: { select: safeUserSelect } },
  })
  if (!conversation) return { error: 'not_found' as const }
  if (!conversation.participants.some((p) => p.id === userId)) return { error: 'forbidden' as const }
  return { conversation }
}

// GET ---------------------------------------------------------------
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const guard = await requireParticipant(id, auth.userId)
    if (guard.error === 'not_found') {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    if (guard.error === 'forbidden') {
      return NextResponse.json({ error: 'Not a participant of this conversation' }, { status: 403 })
    }

    // Mark every message the auth user has NOT sent and not yet read as read.
    await db.message.updateMany({
      where: { conversationId: id, senderId: { not: auth.userId }, read: false },
      data: { read: true },
    })

    const messages = await db.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { name: true } } },
    })

    return NextResponse.json({
      messages: messages.map((m) => toMessageDTO(m, m.sender.name)),
    })
  } catch (err) {
    console.error('[messages:GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST --------------------------------------------------------------
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const guard = await requireParticipant(id, auth.userId)
    if (guard.error === 'not_found') {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    if (guard.error === 'forbidden') {
      return NextResponse.json({ error: 'Not a participant of this conversation' }, { status: 403 })
    }

    const body: unknown = await req.json().catch(() => null)
    const parsed = sendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 })
    }
    const text = parsed.data.text

    const me = auth.userId
    const sender = guard.conversation.participants.find((p) => p.id === me)
    const other = guard.conversation.participants.find((p) => p.id !== me)
    const senderName = sender?.name ?? 'Unknown'
    const now = new Date()

    const [created] = await db.$transaction([
      db.message.create({ data: { conversationId: id, senderId: me, text, createdAt: now } }),
      db.conversation.update({ where: { id }, data: { lastMessageAt: now } }),
    ])

    // DM notification for the other participant (best-effort, never blocks the send).
    if (other) {
      try {
        await db.notification.create({
          data: {
            userId: other.id,
            type: 'dm',
            refId: id,
            message: `${senderName}: ${truncate(text)}`,
          },
        })
      } catch (notifErr) {
        console.error('[messages:POST] notification failed', notifErr)
      }
    }

    return NextResponse.json({ message: toMessageDTO(created, senderName) })
  } catch (err) {
    console.error('[messages:POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
