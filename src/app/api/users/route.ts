/**
 * GET /api/users?role= — all users (SafeUser[]), optional role filter, ordered by name.
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuth } from '@/lib/auth'
import { safeUserSelect, toSafeUser } from '@/lib/serialize'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const auth = await getAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')

    const users = await db.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { name: 'asc' },
      select: safeUserSelect, // explicit fields — password never selected
    })

    return NextResponse.json({ users: users.map(toSafeUser) })
  } catch (err) {
    console.error('[users:GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
