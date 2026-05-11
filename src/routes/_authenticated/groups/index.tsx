import { createFileRoute, redirect } from '@tanstack/react-router'
import AdminGroupsPage from '@/features/admin-groups'

export const Route = createFileRoute('/_authenticated/groups/')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return

    const raw = sessionStorage.getItem('linguapro_user')
    if (!raw) throw redirect({ to: '/sign-in' })

    let user: { role?: string }
    try {
      user = JSON.parse(raw) as { role?: string }
    } catch {
      throw redirect({ to: '/sign-in' })
    }

    if (!user.role) throw redirect({ to: '/sign-in' })

    if (user.role === 'teacher') throw redirect({ to: '/teacher-dashboard' })
    if (user.role !== 'admin') throw redirect({ to: '/student' })
  },
  component: AdminGroupsPage,
})
