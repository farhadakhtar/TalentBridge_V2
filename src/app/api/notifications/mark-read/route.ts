/**
 * POST /api/notifications/mark-read — {ids?: string[], all?: boolean}
 * Marks notifications read, always scoped to the auth user.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const schema = z.object({
  ids: z.array(z.string().min(1)).nonempty().optional(),
  all: z.boolean().optional(),
})

export async function POST(req: Request) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success || (!parsed.data.all && !parsed.data.ids)) {
      return NextResponse.json(
        { error: 'Provide { ids: string[] } or { all: true }' },
        { status: 400 }
      )
    }

    if (parsed.data.all) {
      await db.notification.updateMany({
        where: { userId: auth.userId, read: false },
        data: { read: true },
      })
    } else {
      await db.notification.updateMany({
        where: { userId: auth.userId, id: { in: parsed.data.ids } },
        data: { read: true },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[notifications/mark-read:POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
