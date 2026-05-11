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

const studentGrowthData = [
  { month: 'Jan', students: 180 },
  { month: 'Feb', students: 195 },
  { month: 'Mar', students: 210 },
  { month: 'Apr', students: 225 },
  { month: 'May', students: 240 },
  { month: 'Jun', students: 235 },
  { month: 'Jul', students: 245 },
  { month: 'Aug', students: 260 },
  { month: 'Sep', students: 275 },
  { month: 'Oct', students: 290 },
  { month: 'Nov', students: 305 },
  { month: 'Dec', students: 320 },
]

export function StudentGrowth() {
  return (
    <Card className='col-span-1 rounded-4xl border-none shadow-lg lg:col-span-4 dark:bg-[#0B0F1A] dark:shadow-xl'>
      <CardHeader className='flex flex-row items-center justify-between pb-6'>
        <div className='space-y-1'>
          <CardTitle className='text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Student Growth
          </CardTitle>
          <CardDescription className='text-sm text-gray-600 dark:text-gray-400'>
            Yearly enrollment overview
          </CardDescription>
        </div>
        <Select defaultValue='12months'>
          <SelectTrigger className='h-9 w-45 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'>
            <SelectValue placeholder='Select period' />
          </SelectTrigger>
          <SelectContent className='border-gray-200 dark:border-gray-700'>
            <SelectItem value='12months'>Last 12 Months</SelectItem>
            <SelectItem value='6months'>Last 6 Months</SelectItem>
            <SelectItem value='3months'>Last 3 Months</SelectItem>
            <SelectItem value='1month'>Last Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='px-6 pb-6'>
        <div className='h-80 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={studentGrowthData}
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
      </CardContent>
    </Card>
  )
}
