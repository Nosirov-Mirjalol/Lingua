import { useState } from 'react'
import { ChevronDown, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const data = [
  { month: 'Yan', studentsAdded: 15 },
  { month: 'Fev', studentsAdded: 28 },
  { month: 'Mar', studentsAdded: 22 },
  { month: 'Apr', studentsAdded: 35 },
  { month: 'May', studentsAdded: 42 },
  { month: 'Iyun', studentsAdded: 38 },
  { month: 'Iyul', studentsAdded: 25 },
  { month: 'Avg', studentsAdded: 30 },
  { month: 'Sen', studentsAdded: 45 },
  { month: 'Okt', studentsAdded: 33 },
  { month: 'Noy', studentsAdded: 28 },
  { month: 'Dek', studentsAdded: 40 },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const current = payload[0].payload

    return (
      <div className='rounded-xl border border-border/50 bg-background/95 p-4 shadow-xl backdrop-blur-sm'>
        <p className='text-sm font-semibold text-foreground'>{current.month}</p>
        <p className='text-lg font-bold text-foreground'>
          {current.studentsAdded} students
        </p>
        <p className='text-xs text-muted-foreground'>Qo'shilgan o'quvchilar</p>
      </div>
    )
  }
  return null
}

export function StudentGrowthChart() {
  const [timeFilter, setTimeFilter] = useState('Last 12 Months')

  return (
    <div className='relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/20 p-6 shadow-lg backdrop-blur-sm'>
      {/* Background glow effect */}
      <div className='absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl' />

      <div className='relative flex flex-col gap-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-xl font-semibold text-foreground'>
                Student Growth
              </h3>
              <div className='flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                <TrendingUp size={12} />
                <span>+12.5%</span>
              </div>
            </div>
            <p className='text-sm text-muted-foreground'>
              Monthly enrollment statistics
            </p>
          </div>

          {/* Dropdown Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 gap-2 rounded-lg border border-border/50 bg-background/50 text-xs font-medium hover:bg-background/80'
              >
                {timeFilter}
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='rounded-xl border-border/50'
            >
              <DropdownMenuItem
                className='cursor-pointer rounded-lg'
                onClick={() => setTimeFilter('Last 7 Days')}
              >
                Last 7 Days
              </DropdownMenuItem>
              <DropdownMenuItem
                className='cursor-pointer rounded-lg'
                onClick={() => setTimeFilter('Last 30 Days')}
              >
                Last 30 Days
              </DropdownMenuItem>
              <DropdownMenuItem
                className='cursor-pointer rounded-lg'
                onClick={() => setTimeFilter('Last 12 Months')}
              >
                Last 12 Months
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chart */}
        <div className='h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id='barGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='0%'
                    stopColor='hsl(var(--primary))'
                    stopOpacity={0.9}
                  />
                  <stop
                    offset='100%'
                    stopColor='hsl(var(--primary))'
                    stopOpacity={0.4}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='4 4'
                vertical={false}
                stroke='hsl(var(--border))'
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey='month'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                domain={[0, 50]}
                ticks={[0, 10, 20, 30, 40, 50]}
                width={40}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'hsl(var(--primary)/0.1)' }}
                animationDuration={200}
              />
              <Bar
                dataKey='studentsAdded'
                fill='url(#barGradient)'
                radius={[6, 6, 0, 0]}
                className='transition-all duration-300 hover:opacity-80'
                animationDuration={1000}
                animationBegin={200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Stats */}
        <div className='grid grid-cols-3 gap-4 rounded-2xl bg-muted/30 p-4 backdrop-blur-sm'>
          <div>
            <p className='text-xs text-muted-foreground'>Total Students</p>
            <p className='text-lg font-semibold text-foreground'>2,890</p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground'>Avg. Monthly</p>
            <p className='text-lg font-semibold text-foreground'>241</p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground'>Growth Rate</p>
            <p className='text-lg font-semibold text-emerald-600 dark:text-emerald-400'>
              +12.5%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
