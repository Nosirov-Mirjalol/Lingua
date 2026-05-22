import { useAdminStudents } from './students/useAdminStudents'
import { useAdminTeachers } from './teachers/useAdminTeachers'
import { useAdminGroups } from './groups/useAdminGroups'
import { useAdminCourses } from './courses/useAdminCourses'

/** Dashboard statistikasi uchun barcha studentlar (pagination emas) */
const DASHBOARD_LIST_PAGE_SIZE = 1000

export const useAdminDashboardStats = () => {
  const { data: studentsPage } = useAdminStudents('', 1, DASHBOARD_LIST_PAGE_SIZE)
  const students = studentsPage?.students ?? []
  const totalStudents = studentsPage?.totalCount ?? students.length

  const { data: teachers = [] } = useAdminTeachers()
  const { data: groups = [] } = useAdminGroups()
  const { data: courses = [] } = useAdminCourses('')

  const stats = {
    totalStudents,
    activeStudents: students.filter((s) => s.is_active).length,
    totalTeachers: teachers.length,
    totalGroups: groups.length,
    activeGroups: groups.filter((g: any) => g.status === 'active').length,
    totalCourses: courses.length,
    completionRate: groups.length > 0 
      ? Math.round((groups.filter((g: any) => g.status === 'completed').length / groups.length) * 100)
      : 0,
  }

  return stats
}
