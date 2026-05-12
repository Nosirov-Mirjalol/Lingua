import { createFileRoute, redirect } from '@tanstack/react-router'
import { Chats } from '@/features/chats'
import { getSessionUserRole } from '@/lib/auth-role'

export const Route = createFileRoute('/_authenticated/student/chats')({
  beforeLoad: () => {
    const role = getSessionUserRole()
    if (!role) throw redirect({ to: '/sign-in' })
    if (role === 'admin') throw redirect({ to: '/admin-dashboard' })
    if (role === 'teacher') throw redirect({ to: '/teacher-dashboard' })
    if (role !== 'student') throw redirect({ to: '/sign-in' })
  },
  component: Chats,
})
