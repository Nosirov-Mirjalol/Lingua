import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const notifications = [
    {
      id: 1,
      title: 'Yangi o\'quvchi',
      description: 'Alijon Toirov guruhga qo\'shildi',
      time: '2 daqiqa oldin',
      unread: true,
    },
    {
      id: 2,
      title: 'To\'lov tasdiqlandi',
      description: 'Sardorbek 500,000 so\'m to\'lov qildi',
      time: '1 soat oldin',
      unread: false,
    },
  ]

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative h-9 w-9 rounded-full'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center border-2 border-background p-0 text-[10px]'
              variant='destructive'
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col gap-1'>
            <p className='text-sm font-medium leading-none'>Bildirishnomalar</p>
            <p className='text-xs leading-none text-muted-foreground'>
              Sizda {unreadCount} ta o'qilmagan xabar bor
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className='max-h-80 overflow-y-auto'>
          {notifications.map((n) => (
            <DropdownMenuItem key={n.id} className='flex flex-col items-start gap-1 p-4'>
              <div className='flex w-full items-center justify-between'>
                <span className={cn('text-sm font-semibold', n.unread && 'text-primary')}>
                  {n.title}
                </span>
                <span className='text-[10px] text-muted-foreground'>{n.time}</span>
              </div>
              <p className='text-xs text-muted-foreground line-clamp-2'>
                {n.description}
              </p>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='justify-center text-xs text-primary font-medium cursor-pointer'>
          Barchasini ko'rish
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
