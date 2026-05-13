import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { getSessionUserRole } from '@/lib/auth-role'

export function StudentGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  useEffect(() => {
    const role = getSessionUserRole()
    if (!role) {
      navigate({ to: '/sign-in', replace: true })
      return
    }
    if (role !== 'user' && role !== 'student') {
      if (role === 'teacher') {
        navigate({ to: '/teacher-dashboard', replace: true })
      } else if (role === 'admin') {
        navigate({ to: '/admin-dashboard', replace: true })
      } else {
        navigate({ to: '/sign-in', replace: true })
      }
    }
  }, [navigate])

  return <>{children}</>
}
