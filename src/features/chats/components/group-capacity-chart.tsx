import { Users, Zap } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const MORNING_PERCENTAGE = 65
const EVENING_PERCENTAGE = 35
const MORNING_SEATS = 208
const EVENING_SEATS = 112
const TOTAL_SEATS = MORNING_SEATS + EVENING_SEATS

const getMorningColor = () => 'hsl(38, 92%, 50%)' // amber/yellow
const getEveningColor = () => 'hsl(217, 91%, 60%)' // blue

const getMorningGradient = () => ['#f59e0b', '#d97706']
const getEveningGradient = () => ['#3b82f6', '#2563eb']

export function GroupCapacityChart() {
  const data = [
    { name: 'Morning', value: MORNING_PERCENTAGE },
    { name: 'Evening', value: EVENING_PERCENTAGE },
  ]

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
              Group Load
            </h3>
            <div className='flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'>
              <Zap size={12} />
              <span>Morning/Evening</span>
            </div>
          </div>
          <p className='text-sm text-muted-foreground'>
            Guruhlarning tonggi/kechki yuklanishi
          </p>
        </div>

        {/* Donut Chart */}
        <div className='flex flex-col items-center gap-4'>
          <div className='relative h-52 w-52'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <defs>
                  <linearGradient
                    id='morningGradient'
                    x1='0%'
                    y1='0%'
                    x2='100%'
                    y2='100%'
                  >
                    <stop offset='0%' stopColor={getMorningGradient()[0]} />
                    <stop offset='100%' stopColor={getMorningGradient()[1]} />
                  </linearGradient>
                  <linearGradient
                    id='eveningGradient'
                    x1='0%'
                    y1='0%'
                    x2='100%'
                    y2='100%'
                  >
                    <stop offset='0%' stopColor={getEveningGradient()[0]} />
                    <stop offset='100%' stopColor={getEveningGradient()[1]} />
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
                      fill={
                        index === 0
                          ? 'url(#morningGradient)'
                          : 'url(#eveningGradient)'
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Content */}
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <p className='text-4xl font-bold text-foreground'>
                {TOTAL_SEATS}
              </p>
              <p className='text-xs font-medium text-muted-foreground'>
                Jami o'rinlar
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
                  backgroundColor: `${getMorningColor()}15`,
                }}
              >
                <Users size={14} style={{ color: getMorningColor() }} />
              </div>
              <p className='text-xs text-muted-foreground'>Morning</p>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {MORNING_SEATS}
            </p>
            <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
              <span>{MORNING_PERCENTAGE}%</span>
            </div>
          </div>

          <div className='rounded-2xl border border-border/50 bg-muted/30 p-4 backdrop-blur-sm'>
            <div className='mb-2 flex items-center gap-2'>
              <div
                className='rounded-lg p-1.5'
                style={{
                  backgroundColor: `${getEveningColor()}15`,
                }}
              >
                <Users size={14} style={{ color: getEveningColor() }} />
              </div>
              <p className='text-xs text-muted-foreground'>Evening</p>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {EVENING_SEATS}
            </p>
            <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
              <span>{EVENING_PERCENTAGE}%</span>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-muted-foreground'>Morning Load</span>
            <span className='font-medium text-foreground'>
              {MORNING_PERCENTAGE}%
            </span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-muted/50'>
            <div
              className='h-full rounded-full transition-all duration-1000 ease-out'
              style={{
                width: `${MORNING_PERCENTAGE}%`,
                background: `linear-gradient(90deg, ${getMorningGradient()[0]}, ${getMorningGradient()[1]})`,
              }}
            />
          </div>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-muted-foreground'>Evening Load</span>
            <span className='font-medium text-foreground'>
              {EVENING_PERCENTAGE}%
            </span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-muted/50'>
            <div
              className='h-full rounded-full transition-all duration-1000 ease-out'
              style={{
                width: `${EVENING_PERCENTAGE}%`,
                background: `linear-gradient(90deg, ${getEveningGradient()[0]}, ${getEveningGradient()[1]})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
