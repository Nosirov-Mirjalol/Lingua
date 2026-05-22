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
  { month: 'Jan', enrollment: 80 },
  { month: 'Feb', enrollment: 120 },
  { month: 'Mar', enrollment: 140 },
  { month: 'Apr', enrollment: 180 },
  { month: 'May', enrollment: 200 },
  { month: 'Jun', enrollment: 220 },
  { month: 'Jul', enrollment: 240 },
  { month: 'Aug', enrollment: 260 },
  { month: 'Sep', enrollment: 280 },
  { month: 'Oct', enrollment: 290 },
  { month: 'Nov', enrollment: 300 },
  { month: 'Dec', enrollment: 320 },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const current = payload[0].payload
    const currentIndex = data.findIndex((d) => d.month === current.month)
    const previous = data[currentIndex - 1]

    let growthText = ''
    if (previous) {
      const growthPercent =
        ((current.enrollment - previous.enrollment) / previous.enrollment) * 100
      const sign = growthPercent >= 0 ? '+' : ''
      growthText = `${sign}${growthPercent.toFixed(1)}% from ${previous.month}`
    } else {
      growthText = 'First month'
    }

    return (
      <div className='rounded-xl border border-border/50 bg-background/95 p-4 shadow-xl backdrop-blur-sm'>
        <p className='text-sm font-semibold text-foreground'>{current.month}</p>
        <p className='text-lg font-bold text-foreground'>
          {current.enrollment} students
        </p>
        <p className='text-xs text-muted-foreground'>{growthText}</p>
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
                domain={[0, 320]}
                ticks={[0, 80, 160, 240, 320]}
                width={40}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'hsl(var(--primary)/0.1)' }}
                animationDuration={200}
              />
              <Bar
                dataKey='enrollment'
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
