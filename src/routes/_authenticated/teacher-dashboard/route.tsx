import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionUserRole } from '@/lib/auth-role'
import { TeacherDashboardLayout } from './-TeacherDashboardLayout'

export const Route = createFileRoute('/_authenticated/teacher-dashboard')({
  beforeLoad: () => {
    const role = getSessionUserRole()
    if (!role) throw redirect({ to: '/sign-in' })
    if (role === 'admin') throw redirect({ to: '/admin-dashboard' })
    if (role !== 'teacher') throw redirect({ to: '/student' })
  },
  component: TeacherDashboardLayout,
})

