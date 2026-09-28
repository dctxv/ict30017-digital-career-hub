import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Light and dark appearance.
 *
 * The choice is stored under a single key and written to a `data-theme`
 * attribute on <html>. Every colour in the interface resolves through a token
 * declared for both themes in styles/theme.css, so this attribute is the only
 * thing that has to change — no component reads the theme to decide a colour,
 * and none should start.
 *
 * When nothing is stored, the operating system's preference is followed and
 * kept in step with it. An explicit choice ends that: someone who has picked
 * dark on a laptop that switches to light at sunrise means dark, not "whatever
 * the laptop thinks". Persisting only explicit choices is what makes those two
 * cases distinguishable.
 *
 * index.html applies the stored value before React mounts. Without that the
 * first painted frame is always light, so a dark-theme user sees a white flash
 * on every load. This provider owns the attribute from mount onwards.
 */

export const THEMES = ['light', 'dark']
const STORAGE_KEY = 'careerhub-theme'

const ThemeContext = createContext(null)

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(stored) ? stored : null
  } catch {
    // Private browsing can block storage; the session still gets a theme.
    return null
  }
}

function systemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  // Held as null until the user chooses, which is what lets the system
  // preference keep applying rather than being sampled once at startup.
  const [stored, setStored] = useState(readStoredTheme)
  const [system, setSystem] = useState(systemTheme)

  const theme = stored ?? system

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!window.matchMedia) return undefined
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (event) => setSystem(event.matches ? 'dark' : 'light')
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return
    setStored(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // In-memory selection still applies for this session.
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider.')
  }
  return context
}
