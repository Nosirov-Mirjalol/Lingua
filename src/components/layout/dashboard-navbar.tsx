import { useState } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Bell, Loader2 } from 'lucide-react'

import { Header } from '@/components/layout/header'
import { StudentNotificationModal } from '@/components/student/notifications/StudentNotificationModal'
import { Button } from '@/components/ui/button'
import { ThemeSwitch } from '@/components/theme-switch'
import { useUnreadCount } from '@/features/notifications/hooks'
import {
  useNotificationWebSocket,
  useStudentUnreadCount,
} from '@/hooks/student/useStudentNotifications'

export function DashboardNavbar() {
  const [openNotifications, setOpenNotifications] = useState(false)
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const routerStatus = useRouterState({
    select: (state) => state.status,
  })
  const isStudentArea = pathname.startsWith('/student')
  const isTeacherArea = pathname.startsWith('/teacher-dashboard')

  useNotificationWebSocket({ enabled: isStudentArea })

  const { data: studentUnreadData } = useStudentUnreadCount({
    enabled: isStudentArea,
  })
  const { data: teacherUnreadData } = useUnreadCount({
    enabled: isTeacherArea,
  })

  const unreadCount = isTeacherArea
    ? teacherUnreadData?.unread_count ?? 0
    : studentUnreadData?.unread_count ?? 0

  const handleNotificationClick = () => {
    if (isTeacherArea) {
      navigate({ to: '/teacher-dashboard/notifications' })
      return
    }

    setOpenNotifications(true)
  }

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-2 sm:gap-3'>
          {routerStatus === 'pending' ? (
            <span className='inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground'>
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
              Loading
            </span>
          ) : null}
          <ThemeSwitch />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='relative h-9 w-9 rounded-full text-foreground hover:bg-primary/10'
            onClick={handleNotificationClick}
            aria-label='Open notifications'
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className='absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-background'>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
          
        </div>
      </Header>

      {isStudentArea && (
        <StudentNotificationModal
          open={openNotifications}
          onOpenChange={setOpenNotifications}
        />
      )}
    </>
  )
}
