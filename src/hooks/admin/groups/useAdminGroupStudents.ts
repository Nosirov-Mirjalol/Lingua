import { useQuery } from '@tanstack/react-query'
import { getAdminGroupWithStudents } from '@/api/service/admin/group.service'

export const useAdminGroupStudents = (groupId: number | null) => {
  return useQuery({
    queryKey: ['admin', 'groups', 'students', groupId],
    queryFn: () => getAdminGroupWithStudents(groupId as number),
    enabled: groupId != null && groupId > 0,
  })
}
