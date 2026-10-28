/**
 * GET /api/audit — latest 50 audit log entries with user name + role, newest first.
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/auth'
import type { AuditLogDTO } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { name: true, role: true } } },
    })

    const dtos: AuditLogDTO[] = logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      userName: l.user.name,
      userRole: l.user.role,
      action: l.action,
      createdAt: l.createdAt.toISOString(),
    }))

    return NextResponse.json({ logs: dtos })
  } catch (err) {
    console.error('[audit:GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
