import type { User } from '@/api/service/teacher/user.type'

const MONTH_LABELS = [
  'Yan',
  'Fev',
  'Mar',
  'Apr',
  'May',
  'Iyun',
  'Iyul',
  'Avg',
  'Sen',
  'Okt',
  'Noy',
  'Dek',
] as const

export type StudentGrowthPeriod = '12months' | '6months' | '3months' | '1month'

const PERIOD_MONTHS: Record<StudentGrowthPeriod, number> = {
  '12months': 12,
  '6months': 6,
  '3months': 3,
  '1month': 1,
}

export function periodToMonthCount(period: StudentGrowthPeriod): number {
  return PERIOD_MONTHS[period]
}

export type StudentGrowthChartPoint = {
  month: string
  students: number
}

function getLastNMonthBuckets(count: number) {
  const now = new Date()
  const buckets: Array<{
    key: string
    label: string
  }> = []

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: MONTH_LABELS[date.getMonth()],
    })
  }

  return buckets
}

export function aggregateStudentsByMonth(
  students: User[],
  period: StudentGrowthPeriod
): StudentGrowthChartPoint[] {
  const monthCount = periodToMonthCount(period)
  const buckets = getLastNMonthBuckets(monthCount)
  const counts = new Map(buckets.map((b) => [b.key, 0]))

  for (const student of students) {
    if (!student.created_at) continue
    const date = new Date(student.created_at)
    if (Number.isNaN(date.getTime())) continue

    const key = `${date.getFullYear()}-${date.getMonth()}`
    if (!counts.has(key)) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return buckets.map((bucket) => ({
    month: bucket.label,
    students: counts.get(bucket.key) ?? 0,
  }))
}

export type GroupEnrollmentStats = {
  occupied: number
  available: number
  total: number
  occupiedPercentage: number
}

export type GroupEnrollmentChartSlice = {
  name: string
  value: number
  fill: string
}

export function computeGroupEnrollmentStats(
  students: User[],
  enrolledStudentIds: Set<number>
): GroupEnrollmentStats {
  const totalStudents = students.length
  let occupied = 0

  for (const student of students) {
    if (enrolledStudentIds.has(student.id)) occupied += 1
  }

  const available = Math.max(0, totalStudents - occupied)
  const occupiedPercentage =
    totalStudents > 0 ? Math.round((occupied / totalStudents) * 100) : 0

  return {
    occupied,
    available,
    total: totalStudents,
    occupiedPercentage,
  }
}

export function buildGroupEnrollmentChartData(
  stats: GroupEnrollmentStats
): GroupEnrollmentChartSlice[] {
  if (stats.total === 0) {
    return [{ name: "Ma'lumot yo'q", value: 1, fill: '#E5E7EB' }]
  }

  const slices: GroupEnrollmentChartSlice[] = []

  if (stats.occupied > 0) {
    slices.push({
      name: 'Guruhda',
      value: stats.occupied,
      fill: '#E11D48',
    })
  }

  if (stats.available > 0) {
    slices.push({
      name: 'Guruhsiz',
      value: stats.available,
      fill: '#D1D5DB',
    })
  }

  return slices.length > 0
    ? slices
    : [{ name: 'Guruhsiz', value: 1, fill: '#E5E7EB' }]
}
