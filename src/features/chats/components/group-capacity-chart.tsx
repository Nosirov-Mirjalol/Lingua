import { useEffect, useState } from 'react'
import { TrendingUp, Users, Zap } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const OCCUPANCY_PERCENTAGE = 75
const OCCUPIED_SEATS = 312
const AVAILABLE_SEATS = 104
const TOTAL_SEATS = OCCUPIED_SEATS + AVAILABLE_SEATS

const getOccupancyColor = (percentage: number) => {
  if (percentage < 60) return 'hsl(142, 76%, 36%)' // green
  if (percentage < 85) return 'hsl(38, 92%, 50%)' // yellow/amber
  return 'hsl(0, 84%, 60%)' // red
}

const getOccupancyGradient = (percentage: number) => {
  if (percentage < 60) return ['#22c55e', '#16a34a']
  if (percentage < 85) return ['#f59e0b', '#d97706']
  return ['#ef4444', '#dc2626']
}

export function GroupCapacityChart() {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const duration = 1500 // 1.5 seconds
    const steps = 60
    const increment = OCCUPANCY_PERCENTAGE / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      if (currentStep <= steps) {
        setAnimatedValue(Math.round(increment * currentStep))
      } else {
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [])

  const data = [
    { name: 'Occupied', value: animatedValue },
    { name: 'Available', value: 100 - animatedValue },
  ]

  const COLORS = [getOccupancyColor(OCCUPANCY_PERCENTAGE), 'hsl(var(--muted))']
  const GRADIENT_COLORS = getOccupancyGradient(OCCUPANCY_PERCENTAGE)

  return (
    <div className='relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/20 p-6 shadow-lg backdrop-blur-sm'>
      {/* Background glow effect */}
      <div className='absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl' />

      <div className='relative flex flex-col gap-6'>
        {/* Header */}
        <div>
          <div className='flex items-center gap-2'>
            <h3 className='text-xl font-semibold text-foreground'>
              Group Capacity
            </h3>
            <div
              className='flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium'
              style={{
                backgroundColor: `${getOccupancyColor(OCCUPANCY_PERCENTAGE)}15`,
                color: getOccupancyColor(OCCUPANCY_PERCENTAGE),
              }}
            >
              <Zap size={12} />
              <span>{OCCUPANCY_PERCENTAGE}% Full</span>
            </div>
          </div>
          <p className='text-sm text-muted-foreground'>
            Average fill rate across all groups
          </p>
        </div>

        {/* Donut Chart */}
        <div className='flex flex-col items-center gap-4'>
          <div className='relative h-52 w-52'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <defs>
                  <linearGradient
                    id='donutGradient'
                    x1='0%'
                    y1='0%'
                    x2='100%'
                    y2='100%'
                  >
                    <stop offset='0%' stopColor={GRADIENT_COLORS[0]} />
                    <stop offset='100%' stopColor={GRADIENT_COLORS[1]} />
                  </linearGradient>
                </defs>
                <Pie
                  data={data}
                  cx='50%'
                  cy='50%'
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={0}
                  dataKey='value'
                  stroke='none'
                >
                  {data.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? 'url(#donutGradient)' : COLORS[1]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Content */}
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <p className='text-4xl font-bold text-foreground'>
                {animatedValue}%
              </p>
              <p className='text-xs font-medium text-muted-foreground'>
                OCCUPIED
              </p>
            </div>
          </div>
        </div>

        {/* Mini Statistics Cards */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='rounded-2xl border border-border/50 bg-muted/30 p-4 backdrop-blur-sm'>
            <div className='mb-2 flex items-center gap-2'>
              <div
                className='rounded-lg p-1.5'
                style={{
                  backgroundColor: `${getOccupancyColor(OCCUPANCY_PERCENTAGE)}15`,
                }}
              >
                <Users
                  size={14}
                  style={{ color: getOccupancyColor(OCCUPANCY_PERCENTAGE) }}
                />
              </div>
              <p className='text-xs text-muted-foreground'>Occupied</p>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {OCCUPIED_SEATS}
            </p>
            <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
              <TrendingUp size={10} className='text-emerald-600' />
              <span className='text-emerald-600 dark:text-emerald-400'>
                +8.2%
              </span>
              <span>vs last month</span>
            </div>
          </div>

          <div className='rounded-2xl border border-border/50 bg-muted/30 p-4 backdrop-blur-sm'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='rounded-lg bg-muted/50 p-1.5'>
                <Users size={14} className='text-muted-foreground' />
              </div>
              <p className='text-xs text-muted-foreground'>Available</p>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {AVAILABLE_SEATS}
            </p>
            <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
              <span>{TOTAL_SEATS} total seats</span>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-muted-foreground'>Capacity Progress</span>
            <span className='font-medium text-foreground'>
              {animatedValue}%
            </span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-muted/50'>
            <div
              className='h-full rounded-full transition-all duration-1000 ease-out'
              style={{
                width: `${animatedValue}%`,
                background: `linear-gradient(90deg, ${GRADIENT_COLORS[0]}, ${GRADIENT_COLORS[1]})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
