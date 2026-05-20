import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

type Theme = 'dark' | 'light' | 'system'
type ResolvedTheme = Exclude<Theme, 'system'>

// Teacher panel always uses light mode
const DEFAULT_THEME = 'light'
const TEACHER_THEME_COOKIE_NAME = 'teacher-vite-ui-theme'
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type TeacherThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type TeacherThemeProviderState = {
  defaultTheme: Theme
  resolvedTheme: ResolvedTheme
  theme: Theme
  setTheme: (theme: Theme) => void
  resetTheme: () => void
}

const initialState: TeacherThemeProviderState = {
  defaultTheme: DEFAULT_THEME,
  resolvedTheme: 'light',
  theme: DEFAULT_THEME,
  setTheme: () => null,
  resetTheme: () => null,
}

const TeacherThemeContext =
  createContext<TeacherThemeProviderState>(initialState)

export function TeacherThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = TEACHER_THEME_COOKIE_NAME,
  ...props
}: TeacherThemeProviderProps) {
  const [theme, _setTheme] = useState<Theme>(
    () => (getCookie(storageKey) as Theme) || defaultTheme
  )

  // Teacher panel always uses light mode
  const resolvedTheme = useMemo((): ResolvedTheme => {
    return 'light'
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = (currentResolvedTheme: ResolvedTheme) => {
      root.classList.remove('light', 'dark')
      root.classList.add(currentResolvedTheme)
    }

    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light'
        applyTheme(systemTheme)
      }
    }

    applyTheme(resolvedTheme)

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, resolvedTheme])

  const setTheme = (_theme: Theme) => {
    // Teacher panel always uses light mode - ignore theme changes
    setCookie(storageKey, 'light', THEME_COOKIE_MAX_AGE)
    _setTheme('light')
  }

  const resetTheme = () => {
    removeCookie(storageKey)
    _setTheme('light')
  }

  const contextValue = {
    defaultTheme,
    resolvedTheme,
    resetTheme,
    theme,
    setTheme,
  }

  return (
    <TeacherThemeContext value={contextValue} {...props}>
      {children}
    </TeacherThemeContext>
  )
}

export const useTeacherTheme = () => {
  const context = useContext(TeacherThemeContext)

  if (!context)
    throw new Error(
      'useTeacherTheme must be used within a TeacherThemeProvider'
    )

  return context
}
