/**
 * GET /api/notifications — latest 50 for the auth user + unreadCount.
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/auth'
import type { NotificationDTO, NotificationType } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [rows, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      db.notification.count({ where: { userId: auth.userId, read: false } }),
    ])

    const notifications: NotificationDTO[] = rows.map((n) => ({
      id: n.id,
      type: n.type as NotificationType,
      refId: n.refId,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }))

    return NextResponse.json({ notifications, unreadCount })
  } catch (err) {
    console.error('[notifications:GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
