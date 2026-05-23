import { useQuery } from '@tanstack/react-query'
import { getAdminGroupAvailableStudents } from '@/api/service/admin/group.service'

export const useAdminGroupAvailableStudents = (
  groupId: number | null,
  search = ''
) => {
  const term = search.trim()
  return useQuery({
    queryKey: ['admin', 'groups', groupId, 'available-students', term],
    queryFn: () =>
      getAdminGroupAvailableStudents(groupId as number, term || undefined),
    enabled: groupId != null && groupId > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
