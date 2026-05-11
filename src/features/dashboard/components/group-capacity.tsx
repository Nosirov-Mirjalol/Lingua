import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';




const groupCapacityData = [
  { name: 'Occupied', value: 312, color: '#E11D48' },
  { name: 'Available', value: 104, color: '#9CA3AF' },
]

const totalSeats = 416
const occupiedPercentage = Math.round((312 / totalSeats) * 100)
const occupiedAngle = (312 / totalSeats) * 360

export function GroupCapacity() {
  return (
    <Card className='col-span-1 rounded-4xl border-none shadow-lg lg:col-span-3 dark:bg-[#0B0F1A] dark:shadow-xl'>
      <CardHeader className='pb-6'>
        <div className='space-y-1'>
          <CardTitle className='text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Group Capacity
          </CardTitle>
          <CardDescription className='text-sm text-gray-600 dark:text-gray-400'>
            Average fill rate across all groups
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className='px-6 pb-6'>
        <div className='flex flex-col items-center space-y-6'>
          <div className='relative h-[250px] w-[250px]'>
            {/* SVG donut chart */}
            <svg
              width='250'
              height='250'
              viewBox='0 0 250 250'
              className='-rotate-90 transform'
            >
              {/* Background circle */}
              <circle
                cx='125'
                cy='125'
                r='90'
                fill='none'
                stroke='#E5E7EB'
                strokeWidth='30'
              />
              {/* Occupied segment */}
              <circle
                cx='125'
                cy='125'
                r='90'
                fill='none'
                stroke='url(#occupiedGradient)'
                strokeWidth='30'
                strokeDasharray={`${occupiedAngle} 360`}
                className='transition-all duration-1000 ease-out'
              />
              <defs>
                <linearGradient
                  id='occupiedGradient'
                  x1='0%'
                  y1='0%'
                  x2='100%'
                  y2='100%'
                >
                  <stop offset='0%' stopColor='#E11D48' />
                  <stop offset='100%' stopColor='#B80035' />
                </linearGradient>
              </defs>
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-gray-900 dark:text-white'>
                  {occupiedPercentage}%
                </div>
                <div className='text-sm font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400'>
                  Occupied
                </div>
              </div>
            </div>
          </div>

          <div className='flex w-full justify-around space-x-8'>
            <div className='flex items-center space-x-3 rounded-lg bg-red-50 px-4 py-3 dark:bg-red-900/20'>
              <div className='h-4 w-4 rounded-full bg-gradient-to-br from-red-600 to-red-400' />
              <div>
                <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Occupied Seats
                </div>
                <div className='text-xl font-bold text-gray-900 dark:text-white'>
                  {groupCapacityData[0].value}
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-3 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800/50'>
              <div className='h-4 w-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-300' />
              <div>
                <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Available Seats
                </div>
                <div className='text-xl font-bold text-gray-900 dark:text-white'>
                  {groupCapacityData[1].value}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
