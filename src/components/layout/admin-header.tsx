import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { NotificationBell } from '@/components/notification-bell'

type AdminHeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
}

export function AdminHeader({ className, fixed, children, ...props }: AdminHeaderProps) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }
    document.addEventListener('scroll', onScroll, { passive: true })
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'z-40 h-16 w-full border-b transition-all duration-300',
        fixed && 'sticky top-0 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60',
        offset > 10 ? 'border-border shadow-md ring-1 ring-black/5 dark:ring-white/10' : 'border-transparent',
        className
      )}
      {...props}
    >
      <div className='flex h-full items-center justify-between gap-4 px-4 md:px-8'>
        <div className='flex items-center gap-3'>
          <SidebarTrigger variant='outline' className='h-9 w-9 md:hidden' />
          <div className='hidden lg:block'>
            <Search placeholder='Admin qidiruvi... (⌘K)' className='bg-muted/50 border-none w-64 lg:w-80' />
          </div>
        </div>

        <div className='flex items-center gap-2 sm:gap-4'>
          <div className='flex items-center gap-2'>
            {children}
          </div>

          <div className='hidden h-6 w-[1px] bg-border/60 sm:block' />

          <div className='flex items-center gap-1 sm:gap-2'>
            <div className='lg:hidden'>
              <Search variant='ghost' size='icon' className='rounded-full' />
            </div>
            <NotificationBell />
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  )
}
