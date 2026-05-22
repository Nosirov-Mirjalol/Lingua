import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationCardProps {
  title: string
  message: string
  time: string
  isRead: boolean
  className?: string
  onClick?: () => void
}

export function NotificationCard({
  title,
  message,
  time,
  className,
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
        !isRead ? 'bg-muted/20' : 'bg-transparent',
        className // Ota komponentdan keladigan maxsus paddinglar (masalan: pr-24) shu yerga tushadi
      )}
    >
      {/* Ikonka qismi: shrink-0 orqali ezilib ketishining oldi olingan */}
      <div
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          !isRead ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}
      >
        <Bell className="h-4 w-4" />
      </div>

      {/* Asosiy kontent qismi: flex-1 va min-w-0 bo'sh joyni to'g'ri egallash uchun muhim */}
      <div className="flex flex-1 flex-col min-w-0 space-y-1">
        
        {/* Sarlavha va Vaqt qatori */}
        <div className="flex w-full items-start justify-between gap-3">
          
          {/* Sarlavha konteyneri: matn uzun bo'lsa vaqtni surib yubormasligi uchun min-w-0 qilingan */}
          <div className="flex items-center gap-2 min-w-0">
            <p
              className={cn(
                'text-sm truncate',
                !isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
              )}
            >
              {title}
            </p>
            {!isRead && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>
          
          {/* Vaqt qismi: justify-between sababli doim eng o'ng chekkada turadi */}
          <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap pt-0.5">
            {time}
          </span>
        </div>
        
        {/* Xabar matni */}
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {message}
        </p>
      </div>
    </button>
  )
}

export type { NotificationCardProps }