import { useState } from 'react'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { StudentNotificationModal } from '@/components/student/notifications/StudentNotificationModal'
import { ThemeSwitch } from '@/components/theme-switch'
import { useUnreadCount } from '@/features/notifications/hooks'

export function StudentNavbar() {
  const [openNotifications, setOpenNotifications] = useState(false)
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  })
  const { data: unreadData } = useUnreadCount()
  const unreadCount = unreadData?.unread_count || 0
  const isStudentArea = pathname.startsWith('/student')
  const isTeacherArea = pathname.startsWith('/teacher-dashboard')

  const handleNotificationClick = () => {
    if (isTeacherArea) {
      navigate({ to: '/teacher-dashboard/notifications' })
    } else {
      setOpenNotifications(true)
    }
  }

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-2 sm:gap-3'>
          <ThemeSwitch />

          <div className='relative'>
            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9 rounded-full text-foreground hover:bg-primary/10'
              onClick={handleNotificationClick}
              aria-label='Open notifications'
            >
              <Bell size={18} />
            </Button>
            {unreadCount > 0 && (
              <div className='absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500' />
            )}
          </div>

          <ConfigDrawer />
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
