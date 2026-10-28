/**
 * GET  /api/conversations — conversations where the auth user participates.
 * POST /api/conversations — {otherUserId} → find-or-create a 1:1 conversation.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/auth'
import { safeUserSelect, toConversationDTO } from '@/lib/serialize'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  otherUserId: z.string().min(1, 'otherUserId is required'),
})

// GET ---------------------------------------------------------------
export async function GET(req: Request) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const me = auth.userId

    const conversations = await db.conversation.findMany({
      where: { participants: { some: { id: me } } },
      include: {
        participants: { select: safeUserSelect },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }, // last message only
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    // Batch unread counts: messages in my conversations, not sent by me, still unread.
    const unreadGroups = await db.message.groupBy({
      by: ['conversationId'],
      where: {
        conversationId: { in: conversations.map((c) => c.id) },
        senderId: { not: me },
        read: false,
      },
      _count: { conversationId: true },
    })
    const unreadMap = new Map(unreadGroups.map((g) => [g.conversationId, g._count.conversationId]))

    return NextResponse.json({
      conversations: conversations.map((c) => toConversationDTO(c, unreadMap.get(c.id) ?? 0)),
    })
  } catch (err) {
    console.error('[conversations:GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST --------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const me = auth.userId

    const body: unknown = await req.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'otherUserId is required' }, { status: 400 })
    }
    const otherUserId = parsed.data.otherUserId

    if (otherUserId === me) {
      return NextResponse.json({ error: 'Cannot start a conversation with yourself' }, { status: 400 })
    }

    const other = await db.user.findUnique({ where: { id: otherUserId }, select: { id: true } })
    if (!other) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find an existing conversation that already contains both users.
    const mine = await db.conversation.findMany({
      where: { participants: { some: { id: me } } },
      include: { participants: { select: { id: true } } },
    })
    const existing = mine.find((c) => c.participants.some((p) => p.id === otherUserId))

    let conversationId: string
    if (existing) {
      conversationId = existing.id
    } else {
      const created = await db.conversation.create({
        data: { participants: { connect: [{ id: me }, { id: otherUserId }] } },
      })
      conversationId = created.id
    }

    const conversation = await db.conversation.findUniqueOrThrow({
      where: { id: conversationId },
      include: {
        participants: { select: safeUserSelect },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })

    const unreadCount = await db.message.count({
      where: { conversationId: conversation.id, senderId: { not: me }, read: false },
    })

    return NextResponse.json({ conversation: toConversationDTO(conversation, unreadCount) })
  } catch (err) {
    console.error('[conversations:POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
