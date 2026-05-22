import { useQuery } from '@tanstack/react-query'
import { getAdminGroupAvailableStudents } from '@/api/service/admin/group.service'

export const useAdminGroupAvailableStudents = (groupId: number | null) => {
  return useQuery({
    queryKey: ['admin', 'groups', groupId, 'available-students'],
    queryFn: () => getAdminGroupAvailableStudents(groupId as number),
    enabled: groupId != null && groupId > 0,
  })
}
