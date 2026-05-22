import { BellRing, CheckCheck, Loader2, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NotificationCard } from '@/components/shared/NotificationCard'
import { toast } from 'sonner'
import {
  useStudentNotificationsList,
  useStudentUnreadCount,
  useStudentMarkAsRead,
  useStudentMarkAllRead,
  useStudentDeleteNotifications,
  type StudentNotificationAPI,
} from '@/hooks/student/useStudentNotifications'

interface StudentNotificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
  const { data: notificationsRes, isLoading } = useStudentNotificationsList({
    enabled: open,
  })
  const { data: unreadRes } = useStudentUnreadCount({
    enabled: open,
  })
  const markAsRead = useStudentMarkAsRead()
  const markAllRead = useStudentMarkAllRead()
  const deleteNotifications = useStudentDeleteNotifications()

  const notifications = notificationsRes || []
  const unreadCount = unreadRes?.unread_count ?? notifications.filter(n => !n.is_read).length

  const handleNotificationClick = (n: StudentNotificationAPI) => {
    if (!n.is_read && !markAsRead.isPending) {
      markAsRead.mutate(n.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-full max-w-xl p-0 overflow-hidden rounded-[32px] border-none shadow-2xl bg-white dark:bg-slate-950 gap-0'>
        
        {/* HEADER */}
        <div className='relative pt-7 px-8 pb-3'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-2xl font-bold tracking-tight text-slate-900 dark:text-white'>
              Bildirishnomalar
            </DialogTitle>
            <DialogDescription className="sr-only">
              Sizga kelgan so'nggi xabarlar ro'yxati
            </DialogDescription>
          </div>

          {/* Flex amallar tugmalari (O'qilgan deb belgilash va Tozalash) */}
          {notifications.length > 0 && (
            <div className='flex items-center gap-4 mt-5 border-b pb-3 border-slate-100 dark:border-slate-900'>
              
              {/* Barchasini o'qish */}
              <button
                onClick={() => !markAllRead.isPending && markAllRead.mutate()}
                disabled={markAllRead.isPending || unreadCount === 0}
                className={cn(
                  'text-xs font-bold transition-all duration-200 flex items-center gap-1.5 pb-1 relative after:absolute after:bottom-[-13px] after:left-0 after:h-[2px] after:w-full',
                  unreadCount > 0
                    ? 'text-rose-500 hover:text-rose-600 after:bg-rose-500'
                    : 'text-slate-400 opacity-50 after:bg-transparent'
                )}
              >
                {markAllRead.isPending ? (
                  <Loader2 size={13} className='animate-spin' />
                ) : (
                  <CheckCheck size={14} />
                )}
                Barchasini o'qilgan deb belgilash
              </button>

              {/* Tozalash (O'chirish) */}
              <button
                onClick={() => {
                  const readIds = notifications.filter((n) => n.is_read).map((n) => n.id)
                  if (deleteNotifications.isPending || readIds.length === 0) return
                  deleteNotifications.mutate(readIds, {
                    onSuccess: () => toast.success('O‘qilgan xabarlar o‘chirildi'),
                    onError: () => toast.error('Xabarlarni o‘chirishda xato yuz berdi'),
                  })
                }}
                disabled={deleteNotifications.isPending || notifications.filter((n) => n.is_read).length === 0}
                className={cn(
                  'text-xs font-bold transition-all duration-200 flex items-center gap-1.5 pb-1',
                  notifications.some((n) => n.is_read)
                    ? 'text-slate-500 hover:text-rose-600'
                    : 'text-slate-400 opacity-50'
                )}
              >
                {deleteNotifications.isPending ? (
                  <Loader2 size={13} className='animate-spin' />
                ) : (
                  <Trash2 size={13} />
                )}
                O'qilganlarni tozalash
              </button>

            </div>
          )}
        </div>

        {/* BODY (Xabarlar ro'yxati) */}
        <div className='max-h-[50vh] overflow-y-auto px-6 py-2 scrollbar-hide bg-white dark:bg-slate-950'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <Loader2 size={24} className='animate-spin text-rose-500' />
              <p className='mt-3 text-xs font-medium text-muted-foreground'>Yuklanmoqda...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <div className='flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 mb-3 dark:bg-slate-900'>
                <BellRing size={24} className='text-slate-300' />
              </div>
              <h3 className='text-sm font-bold text-slate-800 dark:text-white'>Hozircha xabarlar yo'q</h3>
            </div>
          ) : (
            <div className='flex flex-col gap-3 pb-6 pt-1'>
              {notifications.map((notification) => {
                const isPendingThis = markAsRead.isPending && markAsRead.variables === notification.id

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'transition-all duration-200 rounded-2xl overflow-hidden',
                      notification.is_read && 'opacity-70'
                    )}
                  >
                    <NotificationCard
                      title={notification.title}
                      message={notification.message}
                      time={isPendingThis ? 'Yuklanmoqda...' : formatRelativeTime(notification.created_at)}
                      isRead={notification.is_read}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className='border-t border-slate-100 dark:border-slate-900 px-8 py-4 flex items-center justify-end bg-slate-50/50 dark:bg-slate-900/30'>
          <Button
            onClick={() => onOpenChange(false)}
            className='h-10 rounded-xl bg-slate-950 px-6 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-900 w-full sm:w-auto'
          >
            Yopish
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}