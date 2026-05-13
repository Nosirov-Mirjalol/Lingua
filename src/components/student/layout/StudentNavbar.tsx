import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudentNotificationModal } from '@/components/student/notifications/StudentNotificationModal'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function StudentNavbar() {
  const [openNotifications, setOpenNotifications] = useState(false)

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-2 sm:gap-3'>
          <Search placeholder='Search...' />
          <ThemeSwitch />

          <Button
            variant='ghost'
            size='icon'
            className='h-9 w-9 rounded-full text-foreground hover:bg-primary/10'
            onClick={() => setOpenNotifications(true)}
            aria-label='Open notifications'
          >
            <Bell size={18} />
          </Button>

          <ConfigDrawer />
        </div>
      </Header>

      <StudentNotificationModal
        open={openNotifications}
        onOpenChange={setOpenNotifications}
      />
    </>
  )
}
