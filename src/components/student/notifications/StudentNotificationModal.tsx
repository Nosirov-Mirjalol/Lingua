import { useMemo } from 'react'
import { BellRing, CheckCircle2, MessageCircle, Star } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useStudentNotifications } from '@/hooks/student/useStudentPortal'

interface StudentNotificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentNotificationModal({
  open,
  onOpenChange,
}: StudentNotificationModalProps) {
  const { data: notifications = [] } = useStudentNotifications()

  const icon = useMemo(
    () => ({
      Reminder: BellRing,
      Announcement: Star,
      Update: MessageCircle,
    }),
    []
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          {notifications.map((notification) => {
            const Icon = icon[notification.category]
            return (
              <div
                key={notification.id}
                className='rounded-3xl border border-slate-200 bg-white p-4 shadow-sm'
              >
                <div className='flex items-start gap-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700'>
                    <Icon size={18} />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center justify-between gap-3'>
                      <p className='font-semibold text-slate-900'>
                        {notification.title}
                      </p>
                      <span className='text-xs text-slate-500'>
                        {notification.time}
                      </span>
                    </div>
                    <p className='mt-1 text-sm leading-6 text-slate-600'>
                      {notification.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className='flex justify-end'>
          <Button variant='secondary' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
