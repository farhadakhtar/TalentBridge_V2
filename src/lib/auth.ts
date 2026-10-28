/**
 * TalentBridge_V2 — JWT auth helpers (server-side only).
 * Token payload: { userId, role }. Signed HS256, 7-day expiry.
 */
import { SignJWT, jwtVerify } from 'jose'
import type { Role } from './types'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'talentbridge-v2-local-dev-secret'
)

export interface TokenPayload {
  userId: string
  role: Role
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    if (typeof payload.userId !== 'string' || typeof payload.role !== 'string') return null
    return { userId: payload.userId, role: payload.role as Role }
  } catch {
    return null
  }
}

/** Extract + verify bearer token from a Request. Returns null when missing/invalid. */
export async function getAuth(req: Request): Promise<TokenPayload | null> {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  return verifyToken(token)
}
