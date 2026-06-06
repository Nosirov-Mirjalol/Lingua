import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionUserRole } from '@/lib/auth-role'

import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { MessagesPage } from '@/pages/MessagesPage'

function AdminChatsPage() {
  return (
    <>
      <AdminHeader fixed>
        
      </AdminHeader>
      <Main
        fixed
        fluid
        className='admin-page flex min-h-0 flex-1 flex-col overflow-hidden py-3 sm:py-4'
      >
        <MessagesPage />
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/admin-chats/')({
  beforeLoad: () => {
    const role = getSessionUserRole()
    if (!role) throw redirect({ to: '/sign-in' })
    if (role === 'teacher') throw redirect({ to: '/teacher-dashboard' })
    if (role !== 'admin') throw redirect({ to: '/student' })
  },
  component: AdminChatsPage,
})
