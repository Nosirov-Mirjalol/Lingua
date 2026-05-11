import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface DashboardCardProps {
  title: string
  value: string
  status: string
  statusVariant?: 'success' | 'neutral' | 'warning'
  icon: LucideIcon
  className?: string
}

const statusVariants = {
  success:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  warning: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function DashboardCard({
  title,
  value,
  status,
  statusVariant = 'neutral',
  icon: Icon,
  className,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        'rounded-[25px] border border-l-4 border-gray-200/50 border-l-red-500 bg-transparent shadow-lg shadow-gray-200/50 dark:border-gray-700/50 dark:border-l-red-600 dark:bg-transparent dark:shadow-lg dark:shadow-gray-800/30',
        className
      )}
    >
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <div className='rounded-full bg-red-50 p-2 dark:bg-red-900/20'>
                <Icon className='h-5 w-5 text-red-600 dark:text-red-400' />
              </div>
              <h3 className='text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400'>
                {title}
              </h3>
            </div>
            <div className='space-y-1'>
              <p className='text-xl font-bold text-gray-900 dark:text-white'>
                {value}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              statusVariants[statusVariant]
            )}
          >
            {status}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
