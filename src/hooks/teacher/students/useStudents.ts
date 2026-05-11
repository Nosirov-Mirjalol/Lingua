import { useQuery } from '@tanstack/react-query'
import { getAvailableStudents } from '@/api/service/teacher/group.service'

export const useStudents = (groupId?: number) => {
  return useQuery({
    queryKey: ['students', 'available', groupId],
    queryFn: () => getAvailableStudents(groupId as number),
    enabled: Boolean(groupId),
  })
}
