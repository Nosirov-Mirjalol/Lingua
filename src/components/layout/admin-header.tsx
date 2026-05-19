import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Bell, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { ThemeSwitch } from '@/components/theme-switch'
import { useUnreadCount } from '@/features/notifications/hooks'

type AdminHeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
}

export function AdminHeader({ className, fixed, children, ...props }: AdminHeaderProps) {
  const navigate = useNavigate()
  const routerStatus = useRouterState({
    select: (state) => state.status,
  })

  const { data: unreadData } = useUnreadCount()
  const unreadCount = unreadData?.unread_count ?? 0

  const handleNotificationClick = () => {
    navigate({ to: '/notifications' })
  }

  return (
    <Header fixed={fixed} className={className} {...props}>
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
        {children}
      </div>
    </Header>
  )
}

