import { useQuery } from '@tanstack/react-query'
import { getAdminStudents } from '@/api/service/admin/student.service'

export const useAdminStudents = (
  search: string,
  page = 1,
  pageSize = 10
) => {
  return useQuery({
    queryKey: ['admin', 'students', 'list', { search, page, pageSize }],
    queryFn: () => getAdminStudents(page, pageSize, search),
    placeholderData: (prev) => prev,
  })
}
