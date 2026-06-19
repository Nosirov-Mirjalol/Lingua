import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardCardProps {
  title: string
  value: string
  status?: string
  statusVariant?: 'success' | 'neutral' | 'warning' | 'info'
  size?: 'sm' | 'md'
  icon: LucideIcon
  className?: string
  valueClassName?: string
}

const statusVariants = {
  success: 'bg-primary/10 text-primary',
  neutral: 'bg-muted text-muted-foreground',
  warning: 'bg-destructive/10 text-destructive',
  info: 'bg-primary/10 text-primary',
}

export function DashboardCard({
  title,
  value,
  status,
  statusVariant = 'neutral',
  size = 'md',
  icon: Icon,
  className,
  valueClassName,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]',
        size === 'sm' ? 'p-4' : 'p-5',
        className
      )}
    >
      {/* Subtle background glow */}
      <div className='pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/8' />

      <div className='relative'>
        <div className='mb-4 flex items-start justify-between'>
          <p
            className={cn(
              'font-semibold tracking-[0.08em] text-muted-foreground uppercase',
              size === 'sm' ? 'text-[10px]' : 'text-xs',
              'sm:text-[9px]'
            )}
          >
            {title}
          </p>
          <div
            className={cn(
              'flex items-center justify-center rounded-xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20',
              size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
            )}
          >
            <Icon
              className={cn(
                'text-primary',
                size === 'sm' ? 'h-4 w-4' : 'h-4.5 w-4.5',
                'sm:h-3.5 sm:w-3.5'
              )}
            />
          </div>
        </div>

        <div className='flex items-end justify-between gap-2'>
          <p
            className={cn(
              'leading-none font-bold tracking-tight text-foreground',
              size === 'sm' ? 'text-2xl' : 'text-3xl',
              'sm:text-xl',
              valueClassName
            )}
          >
            {value}
          </p>
          {status && (
            <span
              className={cn(
                'mb-0.5 inline-flex shrink-0 items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold',
                statusVariants[statusVariant],
                'sm:text-[10px]'
              )}
            >
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
