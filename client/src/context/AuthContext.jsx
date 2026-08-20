import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Shared authentication session.
 *
 * The navbar previously took a `user` prop. Nine of its ten render sites passed
 * nothing and the tenth passed a hardcoded demo name, so the signed-in state was
 * never real: logging in wrote localStorage and navigated away, and nothing read
 * the session back for display. This lifts the session to a provider so every
 * consumer sees the same value and reacts when it changes.
 *
 * The server is the authority. localStorage is a cache that lets the first paint
 * avoid a flash of signed-out chrome, and GET /api/auth/me confirms or discards
 * it on mount. A 401 clears the cache, so hand-editing localStorage to
 * role:"admin" no longer survives the round trip.
 *
 * The token itself is an httpOnly cookie and is deliberately unreadable here.
 */

const STORAGE_KEY = 'user'

const AuthContext = createContext(null)

function readCachedUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    // Corrupted entry, treat as signed out.
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* storage unavailable */ }
    return null
  }
}

function writeCachedUser(user) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Private browsing can block storage; the in-memory session still works.
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readCachedUser)
  // 'pending' until the server has answered once. Route guards wait for this so
  // they never decide access from the cache alone.
  const [status, setStatus] = useState('pending')

  const clearSession = useCallback(() => {
    writeCachedUser(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const applyUser = useCallback((nextUser) => {
    writeCachedUser(nextUser)
    setUser(nextUser)
    setStatus(nextUser ? 'authenticated' : 'unauthenticated')
  }, [])

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      if (response.status === 401) {
        clearSession()
        return null
      }
      if (!response.ok) {
        // Server trouble rather than an auth decision. Keep the cached session
        // so a blip does not sign the user out, but do not upgrade its trust.
        setStatus(user ? 'authenticated' : 'unauthenticated')
        return user
      }
      const data = await response.json()
      applyUser(data.user ?? null)
      return data.user ?? null
    } catch {
      // Network failure. Same reasoning as above.
      setStatus(user ? 'authenticated' : 'unauthenticated')
      return user
    }
  }, [applyUser, clearSession, user])

  // Confirm the cached session against the server once on mount.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (cancelled) return
        if (response.status === 401) {
          clearSession()
          return
        }
        if (!response.ok) {
          setStatus(readCachedUser() ? 'authenticated' : 'unauthenticated')
          return
        }
        const data = await response.json()
        if (cancelled) return
        applyUser(data.user ?? null)
      } catch {
        if (!cancelled) setStatus(readCachedUser() ? 'authenticated' : 'unauthenticated')
      }
    })()
    return () => { cancelled = true }
    // Intentionally runs once: this is the initial session probe, and refresh()
    // covers every later re-check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Records a successful login. The cookie is already set by the server. */
  const login = useCallback((nextUser) => {
    applyUser(nextUser)
  }, [applyUser])

  /**
   * Ends the session. Always clears locally, even if the network call fails,
   * so the user is never left looking signed in with no way out.
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // Ignored on purpose, see above.
    }
    clearSession()
  }, [clearSession])

  const value = useMemo(() => ({
    user,
    status,
    isAuthenticated: status === 'authenticated' && Boolean(user),
    isPending: status === 'pending',
    login,
    logout,
    refresh,
    clearSession,
  }), [user, status, login, logout, refresh, clearSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.')
  }
  return context
}
