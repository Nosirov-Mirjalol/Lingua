import { createFileRoute, redirect, lazyRouteComponent } from '@tanstack/react-router'
import { getSessionUserRole } from '@/lib/auth-role'

export const Route = createFileRoute('/_authenticated/admin-students/')({
  beforeLoad: () => {
    const role = getSessionUserRole()
    if (!role) throw redirect({ to: '/sign-in' })
    if (role === 'teacher') throw redirect({ to: '/teacher-dashboard' })
    if (role !== 'admin') throw redirect({ to: '/student' })
  },
  component: lazyRouteComponent(() => import('@/features/admin-students')),
})
