import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationCardProps {
  title: string
  message: string
  time: string
  isRead: boolean
  onClick?: () => void
}

export function NotificationCard({
  title,
  message,
  time,
  isRead,
  onClick,
}: NotificationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-4 rounded-xl p-4 text-left transition-colors',
        'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        !isRead ? 'bg-muted/20' : 'bg-transparent'
      )}
    >
      {/* Ikonka */}
      <div
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          !isRead ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}
      >
        <Bell className="h-4 w-4" />
      </div>

      {/* Matn qismi */}
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'text-sm',
                !isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
              )}
            >
              {title}
            </p>
            {/* O'qilmagan xabar nuqtasi sarlavha yonida */}
            {!isRead && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
            {time}
          </span>
        </div>
        
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {message}
        </p>
      </div>
    </button>
  )
}

export type { NotificationCardProps }