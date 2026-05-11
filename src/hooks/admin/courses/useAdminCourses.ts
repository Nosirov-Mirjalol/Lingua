import { useQuery } from '@tanstack/react-query'

import { getAdminCourses } from '@/api/service/admin/course.service'

export const useAdminCourses = (search: string) => {
  return useQuery({
    queryKey: ['admin', 'courses', 'list', { search }],
    queryFn: () => getAdminCourses(search),
  })
}
