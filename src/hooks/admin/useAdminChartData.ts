import { useMemo, useState } from 'react'
import { useAdminGroups } from './groups/useAdminGroups'
import { useAdminStudents } from './students/useAdminStudents'
import {
  aggregateStudentsByMonth,
  computeGroupEnrollmentStats,
  type StudentGrowthPeriod,
} from '@/lib/admin-chart-data'

export const useAdminChartData = () => {
  const [growthPeriod, setGrowthPeriod] =
    useState<StudentGrowthPeriod>('12months')

  const { data: students = [], isLoading: studentsLoading } =
    useAdminStudents('')
  const { data: groups = [], isLoading: groupsLoading } = useAdminGroups()

  const studentGrowthData = useMemo(
    () => aggregateStudentsByMonth(students, growthPeriod),
    [students, growthPeriod]
  )

  const groupEnrollment = useMemo(
    () => computeGroupEnrollmentStats(students, groups),
    [students, groups]
  )

  const maxStudentsInMonth = useMemo(
    () => Math.max(0, ...studentGrowthData.map((d) => d.students)),
    [studentGrowthData]
  )

  return {
    studentGrowthData,
    growthPeriod,
    setGrowthPeriod,
    groupEnrollment,
    maxStudentsInMonth,
    isLoading: studentsLoading || groupsLoading,
  }
}
