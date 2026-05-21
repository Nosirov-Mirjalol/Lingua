import { useAdminStudents } from './students/useAdminStudents'
import { useAdminTeachers } from './teachers/useAdminTeachers'
import { useAdminGroups } from './groups/useAdminGroups'
import { useAdminCourses } from './courses/useAdminCourses'

export const useAdminDashboardStats = () => {
  const { data: students = [] } = useAdminStudents('')
  const { data: teachers = [] } = useAdminTeachers()
  const { data: groups = [] } = useAdminGroups()
  const { data: courses = [] } = useAdminCourses('')

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter((s: any) => s.is_active).length,
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
