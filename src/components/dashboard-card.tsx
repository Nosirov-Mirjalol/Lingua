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
}

const statusVariants = {
  success:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  neutral:
    'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400',
  warning:
    'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  info: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
}

export function DashboardCard({
  title,
  value,
  status,
  statusVariant = 'neutral',
  size = 'md',
  icon: Icon,
  className,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] dark:bg-slate-900 dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
        size === 'sm' ? 'p-4' : 'p-5',
        className
      )}
    >
      {/* Subtle background glow */}
      <div className='pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-500/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-rose-500/8 dark:bg-rose-500/8 dark:group-hover:bg-rose-500/12' />

      <div className='relative'>
        <div className='mb-4 flex items-start justify-between'>
          <p
            className={cn(
              'font-semibold tracking-[0.08em] text-slate-400 uppercase dark:text-slate-500',
              size === 'sm' ? 'text-[10px]' : 'text-xs'
            )}
          >
            {title}
          </p>
          <div
            className={cn(
              'flex items-center justify-center rounded-xl bg-rose-50 transition-colors duration-300 group-hover:bg-rose-100 dark:bg-rose-950/40 dark:group-hover:bg-rose-950/60',
              size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
            )}
          >
            <Icon
              className={cn(
                'text-[#b80035] dark:text-rose-400',
                size === 'sm' ? 'h-4 w-4' : 'h-4.5 w-4.5'
              )}
            />
          </div>
        </div>

        <div className='flex items-end justify-between gap-2'>
          <p
            className={cn(
              'font-bold leading-none tracking-tight text-slate-900 dark:text-slate-50',
              size === 'sm' ? 'text-2xl' : 'text-3xl'
            )}
          >
            {value}
          </p>
          {status && (
            <span
              className={cn(
                'mb-0.5 inline-flex shrink-0 items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold',
                statusVariants[statusVariant]
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