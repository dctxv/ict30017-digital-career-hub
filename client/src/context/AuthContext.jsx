import { createContext, useContext, useMemo, useState } from 'react'

/**
 * Shared logged-in user state.
 *
 * Previously each page independently decided what to show in the navbar:
 * Home.jsx and Register.jsx never passed a user at all (always showed
 * "Log in"/"Sign up" regardless of actual login state), and
 * ResumeReview.jsx passed a hardcoded placeholder name that was never
 * replaced with the real logged-in user. Login.jsx wrote to localStorage
 * but nothing ever read it back.
 *
 * This lifts the user into a provider, the same pattern as LanguageContext,
 * so every page reads the same source of truth automatically.
 */

const STORAGE_KEY = 'user'
const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(readStoredUser)

  const login = (userData) => {
    setUserState(userData)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    } catch {
      // Storage can be unavailable in private browsing; the in-memory
      // value still works for the session.
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // Even if the network call fails, still clear local state below —
      // the user should never feel "stuck" logged in on their own screen.
    }
    setUserState(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore — in-memory state is already cleared.
    }
  }

  const value = useMemo(() => ({ user, login, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.')
  }
  return context
}
