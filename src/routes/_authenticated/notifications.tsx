import { createFileRoute, redirect } from '@tanstack/react-router'
import NotificationsPage from '@/features/notifications'
import { getSessionUserRole } from '@/lib/auth-role'

export const Route = createFileRoute('/_authenticated/notifications')({
  beforeLoad: () => {
    const role = getSessionUserRole()
    if (!role) throw redirect({ to: '/sign-in' })
    if (role === 'teacher') throw redirect({ to: '/teacher-dashboard' })
    if (role !== 'admin') throw redirect({ to: '/student' })
  },
  component: NotificationsPage,
})
