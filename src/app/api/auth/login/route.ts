/**
 * POST /api/auth/login — {email, password} → {token, user}
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { toSafeUser } from '@/lib/serialize'
import type { Role } from '@/lib/types'

export const dynamic = 'force-dynamic'

const loginSchema = z.object({
  email: z.string().min(3).email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null)
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please provide a valid email and password.' },
        { status: 400 }
      )
    }

    const email = parsed.data.email.toLowerCase().trim()
    const user = await db.user.findUnique({ where: { email } })

    // Same generic message whether the email or the password is wrong.
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    await db.auditLog.create({
      data: { userId: user.id, action: 'login' },
    })

    const token = await signToken({ userId: user.id, role: user.role as Role })
    return NextResponse.json({ token, user: toSafeUser(user) })
  } catch (err) {
    console.error('[auth/login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
