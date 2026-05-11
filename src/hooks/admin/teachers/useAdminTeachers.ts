import { useQuery } from '@tanstack/react-query'
import { getAdminTeachers } from '@/api/service/admin/teacher.service'

export const useAdminTeachers = () => {
  return useQuery({
    queryKey: ['admin', 'teachers', 'list'],
    queryFn: () => getAdminTeachers(),
  })
}
