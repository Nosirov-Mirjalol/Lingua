import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'

function parseCurrentUser() {
  if (typeof window === 'undefined') return null

  const raw = sessionStorage.getItem('linguapro_user')
  if (!raw) return null

  try {
    return JSON.parse(raw) as { role?: string }
  } catch {
    return null
  }
}

export function StudentGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  useEffect(() => {
    const user = parseCurrentUser()
    if (!user?.role) {
      navigate({ to: '/sign-in', replace: true })
      return
    }
    if (user.role !== 'user' && user.role !== 'student') {
      if (user.role === 'teacher') {
        navigate({ to: '/teacher-dashboard', replace: true })
      } else if (user.role === 'admin') {
        navigate({ to: '/admin-dashboard', replace: true })
      } else {
        navigate({ to: '/sign-in', replace: true })
      }
    }
  }, [navigate])

  return <>{children}</>
}
