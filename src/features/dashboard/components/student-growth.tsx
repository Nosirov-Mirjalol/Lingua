import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  StudentGrowthChartPoint,
  StudentGrowthPeriod,
} from '@/lib/admin-chart-data'

type StudentGrowthProps = {
  data: StudentGrowthChartPoint[]
  period: StudentGrowthPeriod
  onPeriodChange: (period: StudentGrowthPeriod) => void
  maxValue: number
  isLoading?: boolean
}

function yAxisTicks(maxValue: number): number[] {
  if (maxValue <= 0) return [0, 1, 2, 3, 4]
  const step = Math.max(1, Math.ceil(maxValue / 4))
  const top = Math.ceil(maxValue / step) * step
  const ticks: number[] = []
  for (let v = 0; v <= top; v += step) ticks.push(v)
  return ticks
}

export function StudentGrowth({
  data,
  period,
  onPeriodChange,
  maxValue,
  isLoading,
}: StudentGrowthProps) {
  const yTicks = yAxisTicks(maxValue)
  const yMax = yTicks[yTicks.length - 1] ?? 4

  return (
    <Card className='col-span-1 rounded-4xl border-none shadow-lg lg:col-span-4 dark:bg-[#0B0F1A] dark:shadow-xl'>
      <CardHeader className='flex flex-row items-center justify-between pb-6'>
        <div className='space-y-1'>
          <CardTitle className='text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Yangi o&apos;quvchilar
          </CardTitle>
          <CardDescription className='text-sm text-gray-600 dark:text-gray-400'>
            Har oy qo&apos;shilgan o&apos;quvchilar soni
          </CardDescription>
        </div>
        <Select
          value={period}
          onValueChange={(v) => onPeriodChange(v as StudentGrowthPeriod)}
        >
          <SelectTrigger className='h-9 w-45 border-gray-200 bg-background dark:border-gray-700'>
            <SelectValue placeholder='Davr' />
          </SelectTrigger>
          <SelectContent className='border-gray-200 dark:border-gray-700'>
            <SelectItem value='12months'>So&apos;nggi 12 oy</SelectItem>
            <SelectItem value='6months'>So&apos;nggi 6 oy</SelectItem>
            <SelectItem value='3months'>So&apos;nggi 3 oy</SelectItem>
            <SelectItem value='1month'>So&apos;nggi oy</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='px-6 pb-6'>
        {isLoading ? (
          <div className='flex h-[320px] items-center justify-center text-sm text-muted-foreground'>
            Yuklanmoqda...
          </div>
        ) : (
          <div className='w-full'>
            <ResponsiveContainer width='100%' height={320}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id='colorGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#E11D48' stopOpacity={0.9} />
                    <stop offset='95%' stopColor='#F87171' stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  className='opacity-20'
                  stroke='#E5E7EB'
                  strokeWidth={1}
                />
                <XAxis
                  dataKey='month'
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  domain={[0, yMax]}
                  ticks={yTicks}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                  }}
                  labelStyle={{ fontWeight: 600, color: '#111827' }}
                  itemStyle={{ color: '#E11D48', fontWeight: 500 }}
                  formatter={(value) => [`${value} ta`, "Qo'shilgan"]}
                />
                <Bar
                  dataKey='students'
                  fill='url(#colorGradient)'
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                  animationDuration={1000}
                  animationBegin={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
