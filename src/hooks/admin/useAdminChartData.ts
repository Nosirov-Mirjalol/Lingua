import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchEnrolledStudentUserIds } from '@/api/service/group/group-members.service'
import { useAdminGroups } from './groups/useAdminGroups'
import { useAdminStudents } from './students/useAdminStudents'
import {
  aggregateStudentsByMonth,
  computeGroupEnrollmentStats,
  type StudentGrowthPeriod,
} from '@/lib/admin-chart-data'

/** Grafiklar uchun barcha studentlar (pagination emas) */
const CHART_LIST_PAGE_SIZE = 1000

export const useAdminChartData = () => {
  const [growthPeriod, setGrowthPeriod] =
    useState<StudentGrowthPeriod>('12months')

  const { data: studentsPage, isLoading: studentsLoading } = useAdminStudents(
    '',
    1,
    CHART_LIST_PAGE_SIZE
  )
  const students = studentsPage?.students ?? []
  const { data: groups = [], isLoading: groupsLoading } = useAdminGroups()

  const groupIds = useMemo(
    () => groups.map((g) => g.id).filter((id) => Number.isFinite(id)),
    [groups]
  )

  const {
    data: enrolledStudentIds = new Set<number>(),
    isLoading: enrollmentLoading,
  } = useQuery({
    queryKey: ['admin', 'chart', 'enrolled-student-ids', groupIds],
    queryFn: () => fetchEnrolledStudentUserIds(groupIds),
    enabled: !groupsLoading,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const studentGrowthData = useMemo(
    () => aggregateStudentsByMonth(students, growthPeriod),
    [students, growthPeriod]
  )

  const groupEnrollment = useMemo(
    () => computeGroupEnrollmentStats(students, enrolledStudentIds),
    [students, enrolledStudentIds]
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
    isLoading: studentsLoading || groupsLoading || enrollmentLoading,
  }
}
