import { useQuery } from '@tanstack/react-query'

import { getTeacherGroups } from '@/api/service/teacher/group.service'

export const useTeacherGroups = () => {
  return useQuery({
    queryKey: ['teacher', 'groups', 'my'],
    queryFn: () => getTeacherGroups(),
  })
}
