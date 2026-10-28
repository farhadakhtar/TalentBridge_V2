'use client'

/**
 * TalentBridge_V2 — auth context.
 * Session = JWT in localStorage (via api-client helpers) + cached SafeUser.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ApiError,
  CURRENT_USER_KEY,
  api,
  clearSession,
  getToken,
  setSession,
} from '@/lib/api-client'
import type { SafeUser } from '@/lib/types'

interface AuthContextValue {
  user: SafeUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<SafeUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readCachedUser(): SafeUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SafeUser
    return parsed && typeof parsed.id === 'string' ? parsed : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Hydrate session from localStorage, then re-validate the token in the background.
  // All state updates happen inside the promise callback (never synchronously in the effect body).
  useEffect(() => {
    let cancelled = false
    const token = getToken()
    const cached = readCachedUser()

    const validate = token && cached ? api.getNotifications() : Promise.resolve(null)

    validate
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) return 'INVALID_SESSION'
        return null
      })
      .then((result) => {
        if (cancelled) return
        if (!token || !cached) {
          clearSession()
          setUser(null)
        } else if (result === 'INVALID_SESSION') {
          clearSession()
          setUser(null)
        } else {
          setUser(cached)
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await api.login(email.trim(), password)
    setSession(token)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u))
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** Returns a callback that logs the user out on any 401 ApiError. */
export function useAuthGuard() {
  const { logout } = useAuth()
  return useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) logout()
    },
    [logout],
  )
}

/** Effect variant — call with a query/mutation `error` value. */
export function useAuthErrorEffect(error: unknown) {
  const guard = useAuthGuard()
  useEffect(() => {
    guard(error)
  }, [guard, error])
}
