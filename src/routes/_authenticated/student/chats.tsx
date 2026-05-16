import { createFileRoute, lazyRouteComponent, redirect } from '@tanstack/react-router'
import { getSessionUserRole } from '@/lib/auth-role'

export const Route = createFileRoute('/_authenticated/student/chats')({
  beforeLoad: () => {
    const role = getSessionUserRole()
    if (!role) throw redirect({ to: '/sign-in' })
    if (role === 'admin') throw redirect({ to: '/admin-dashboard' })
    if (role === 'teacher') throw redirect({ to: '/teacher-dashboard' })
    if (role !== 'student') throw redirect({ to: '/sign-in' })
  },
  component: lazyRouteComponent(() => import('@/features/chats'), 'Chats'),
})
