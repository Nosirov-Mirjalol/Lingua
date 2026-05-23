import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  buildGroupEnrollmentChartData,
  type GroupEnrollmentStats,
} from '@/lib/admin-chart-data'

type GroupCapacityProps = {
  stats: GroupEnrollmentStats
  isLoading?: boolean
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number }>
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className='rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md'>
      <p className='font-medium text-foreground'>{item.name}</p>
      <p className='text-muted-foreground'>{item.value} ta o&apos;quvchi</p>
    </div>
  )
}

export function GroupCapacity({ stats, isLoading }: GroupCapacityProps) {
  const { occupied, available, total, occupiedPercentage } = stats
  const chartData = buildGroupEnrollmentChartData(stats)

  return (
    <Card className='col-span-1 rounded-4xl border-none shadow-lg lg:col-span-3 dark:bg-[#0B0F1A] dark:shadow-xl'>
      <CardHeader className='pb-4'>
        <div className='space-y-1'>
          <CardTitle className='text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Guruh biriktirish
          </CardTitle>
          <CardDescription className='text-sm text-gray-600 dark:text-gray-400'>
            O&apos;quvchilarning guruhlarga biriktirilishi
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className='px-6 pb-6'>
        {isLoading ? (
          <div className='flex h-[280px] items-center justify-center text-sm text-muted-foreground'>
            Yuklanmoqda...
          </div>
        ) : total === 0 ? (
          <div className='flex h-[280px] flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground'>
            <p>Hali o&apos;quvchilar ro&apos;yxati bo&apos;sh</p>
            <p className='text-xs'>Talaba qo&apos;shilgach grafik yangilanadi</p>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-6'>
            <div className='relative h-[220px] w-full max-w-[240px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx='50%'
                    cy='50%'
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={chartData.length > 1 ? 3 : 0}
                    dataKey='value'
                    stroke='none'
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-gray-900 dark:text-white'>
                    {occupiedPercentage}%
                  </div>
                  <div className='text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400'>
                    Guruhda
                  </div>
                  <div className='mt-0.5 text-xs text-muted-foreground'>
                    {occupied} / {total}
                  </div>
                </div>
              </div>
            </div>

            <div className='grid w-full grid-cols-2 gap-3'>
              <div className='flex items-center gap-3 rounded-xl bg-rose-50 px-4 py-3 dark:bg-rose-950/30'>
                <div className='h-3 w-3 shrink-0 rounded-full bg-[#E11D48]' />
                <div className='min-w-0'>
                  <div className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                    Guruhda
                  </div>
                  <div className='text-lg font-bold text-gray-900 dark:text-white'>
                    {occupied}
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-3 rounded-xl bg-gray-100 px-4 py-3 dark:bg-gray-800/50'>
                <div className='h-3 w-3 shrink-0 rounded-full bg-gray-400' />
                <div className='min-w-0'>
                  <div className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                    Guruhsiz
                  </div>
                  <div className='text-lg font-bold text-gray-900 dark:text-white'>
                    {available}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
