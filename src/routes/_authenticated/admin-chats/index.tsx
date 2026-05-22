import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionUserRole } from '@/lib/auth-role'
import { MessagesPage } from '@/pages/MessagesPage'

export const Route = createFileRoute('/_authenticated/admin-chats/')({
  beforeLoad: () => {
    const role = getSessionUserRole()
    if (!role) throw redirect({ to: '/sign-in' })
    if (role === 'teacher') throw redirect({ to: '/teacher-dashboard' })
    if (role !== 'admin') throw redirect({ to: '/student' })
  },
  component: () => (
    <div className="h-full w-full [&>div]:!max-w-none [&>div]:!px-4">
      <MessagesPage />
    </div>
  ),
})
