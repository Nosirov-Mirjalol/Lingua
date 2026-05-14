import { create } from 'zustand'
import { getCookie, removeCookie, setCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'

interface AuthUser {
  accountNo: string
  email: string
  role: 'admin' | 'teacher' | 'student' | 'user'
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

// Initialize user from sessionStorage (set by useLogin hook)
const getInitialUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null

  try {
    const storedUser = sessionStorage.getItem('linguapro_user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      return {
        accountNo: String(user.id),
        email: user.username,
        role: user.role || 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
    }
  } catch (error) {
    console.error('Error parsing stored user:', error)
  }

  return null
}

// Initialize token from sessionStorage or cookie
const getInitialToken = (): string => {
  if (typeof window === 'undefined') return ''

  try {
    const sessionToken = sessionStorage.getItem('linguapro_access_token')
    if (sessionToken) return sessionToken

    const cookieState = getCookie(ACCESS_TOKEN)
    return cookieState ? JSON.parse(cookieState) : ''
  } catch (error) {
    console.error('Error getting initial token:', error)
    return ''
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const initToken = getInitialToken()
  const initUser = getInitialUser()

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          sessionStorage.removeItem('linguapro_user')
          sessionStorage.removeItem('linguapro_access_token')
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
