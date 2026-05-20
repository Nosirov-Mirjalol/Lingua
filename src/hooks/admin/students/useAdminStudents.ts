import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAdminStudents } from '@/api/service/admin/student.service'
import type { User } from '@/api/service/teacher/user.type'

export const useAdminStudents = (search: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'students', 'list', { search }],
    queryFn: () => getAdminStudents(),
  })

  const students = useMemo(() => {
    if (!data?.length) return []
    return data.filter((user: User) => {
      const role = user.role != null ? String(user.role).toLowerCase() : ''
      return !role || role === 'student'
    })
  }, [data])

  return {
    data: students,
    isLoading,
    isError,
    totalCount: data?.length ?? 0,
  }
}
