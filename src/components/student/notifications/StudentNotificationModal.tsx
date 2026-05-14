import { useMemo } from 'react'
import { BellRing, MessageCircle, Star, CheckCheck, Loader2, LucideIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useStudentNotificationsList,
  useStudentUnreadCount,
  useStudentMarkAsRead,
  useStudentMarkAllRead,
  type StudentNotificationAPI,
} from '@/hooks/student/useStudentNotifications'

interface StudentNotificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CategoryKey = 'Reminder' | 'Announcement' | 'Update'

function deriveCategory(title: string): CategoryKey {
  const t = title.toLowerCase()
  if (t.includes('eslatma') || t.includes('reminder') || t.includes('dars'))
    return 'Reminder'
  if (
    t.includes("e'lon") ||
    t.includes('yangi') ||
    t.includes('announcement') ||
    t.includes('kurs')
  )
    return 'Announcement'
  return 'Update'
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (m < 1) return 'Hozirgina'
  if (m < 60) return `${m} daqiqa oldin`
  if (h < 24) return `${h} soat oldin`
  return `${d} kun oldin`
}

export function StudentNotificationModal({
  open,
  onOpenChange,
}: StudentNotificationModalProps) {
  const { data: notificationsRes, isLoading } = useStudentNotificationsList()
  const { data: unreadRes } = useStudentUnreadCount()
  const markAsRead = useStudentMarkAsRead()
  const markAllRead = useStudentMarkAllRead()

  const notifications = notificationsRes || []
  const unreadCount = unreadRes?.unread_count ?? notifications.filter(n => !n.is_read).length

  const iconMap = useMemo<Record<CategoryKey, LucideIcon>>(
    () => ({
      Reminder: BellRing,
      Announcement: Star,
      Update: MessageCircle,
    }),
    []
  )

  const handleNotificationClick = (n: StudentNotificationAPI) => {
    if (!n.is_read && !markAsRead.isPending) {
      markAsRead.mutate(n.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white dark:bg-slate-950'>
        <div className='relative flex flex-col border-b bg-slate-50/50 px-8 py-7 dark:bg-slate-900/50'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <DialogTitle className='text-2xl font-black tracking-tight text-slate-900 dark:text-white'>
                Bildirishnomalar
              </DialogTitle>
              <DialogDescription className="sr-only">
                Sizga kelgan so'nggi bildirishnomalar va xabarlar ro'yxati
              </DialogDescription>
              {unreadCount > 0 && (
                <p className='text-xs font-semibold text-rose-500 uppercase tracking-widest'>
                  {unreadCount} ta yangi xabar
                </p>
              )}
            </div>
            {notifications.length > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => !markAllRead.isPending && markAllRead.mutate()}
                disabled={markAllRead.isPending || unreadCount === 0}
                className={cn(
                  'h-10 rounded-full border px-5 text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 mr-8',
                  unreadCount > 0
                    ? 'border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white shadow-sm'
                    : 'border-slate-200 bg-slate-100 text-slate-400 opacity-50'
                )}
              >
                {markAllRead.isPending ? (
                  <Loader2 size={14} className='animate-spin mr-2' />
                ) : (
                  <CheckCheck size={14} className='mr-2' />
                )}
                Barchasini o'qish
              </Button>
            )}
          </div>
        </div>
        <div className='max-h-[60vh] overflow-y-auto px-6 py-4 scrollbar-hide'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-20'>
              <div className='relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <Loader2 size={24} className='animate-spin' />
              </div>
              <p className='mt-4 text-xs font-medium text-muted-foreground'>Xabarlar yuklanmoqda...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-20 text-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-6 dark:bg-slate-900'>
                <BellRing size={32} className='text-slate-300 dark:text-slate-700' />
              </div>
              <h3 className='text-lg font-bold text-slate-900 dark:text-white'>Hozircha xabarlar yo'q</h3>
              <p className='mt-1 text-sm text-muted-foreground'>Yangi bildirishnomalar shu yerda ko'rinadi</p>
            </div>
          ) : (
            <div className='flex flex-col gap-3 pb-4'>
              {notifications.map((notification) => {
                const category = deriveCategory(notification.title)
                const Icon = iconMap[category]
                const isPendingThis = markAsRead.isPending && markAsRead.variables === notification.id

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'group relative cursor-pointer rounded-2xl border p-4 transition-all duration-300',
                      notification.is_read
                        ? 'bg-transparent border-transparent opacity-60'
                        : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 dark:bg-slate-900 dark:border-slate-800'
                    )}
                  >
                    <div className='flex items-start gap-4'>
                      <div className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors',
                        notification.is_read
                          ? 'bg-muted text-muted-foreground/50'
                          : 'bg-primary/5 text-primary'
                      )}>
                        {isPendingThis ? (
                          <Loader2 size={18} className='animate-spin' />
                        ) : (
                          <Icon size={18} />
                        )}
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center justify-between gap-2'>
                          <p className={cn(
                            'text-sm transition-colors',
                            notification.is_read ? 'font-medium text-slate-500' : 'font-bold text-slate-900 dark:text-white'
                          )}>
                            {notification.title}
                          </p>
                          <span className='whitespace-nowrap text-[10px] font-bold text-slate-400'>
                            {formatRelativeTime(notification.created_at)}
                          </span>
                        </div>
                        <p className={cn(
                          'mt-1 text-sm leading-relaxed transition-colors',
                          notification.is_read ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'
                        )}>
                          {notification.message}
                        </p>
                      </div>

                      {!notification.is_read && (
                        <div className='absolute right-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity' />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div className='flex items-center justify-end border-t bg-slate-50/50 px-8 py-5 dark:bg-slate-900/50'>
          <Button
            onClick={() => onOpenChange(false)}
            className='h-11 rounded-xl bg-slate-900 px-10 font-bold text-white hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-900'
          >
            Yopish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
