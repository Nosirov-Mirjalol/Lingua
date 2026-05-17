import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchAdminStudents } from '@/api/service/admin/student.service'
import type { User } from '@/api/service/teacher/user.type'

export const useAdminStudents = (
  search: string,
  page = 1,
  pageSize = 10
) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'students', 'list', { search, page, pageSize }],
    queryFn: () => searchAdminStudents(search, page, pageSize),
  })

  const students = useMemo(() => {
    if (!data?.results?.length) return []
    return data.results.filter((user: User) => {
      const role = user.role != null ? String(user.role).toLowerCase() : ''
      return !role || role === 'student'
    })
  }, [data])

  return {
    data: students,
    isLoading,
    isError,
    totalCount: data?.count ?? students.length,
    hasNext: Boolean(data?.next),
    hasPrevious: Boolean(data?.previous),
  }
}
