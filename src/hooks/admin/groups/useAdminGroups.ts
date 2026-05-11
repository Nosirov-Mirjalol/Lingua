import { useQuery } from '@tanstack/react-query'

import { getAdminGroups } from '@/api/service/admin/group.service'

export const useAdminGroups = () => {
  return useQuery({
    queryKey: ['admin', 'groups', 'list'],
    queryFn: () => getAdminGroups(),
  })
}
