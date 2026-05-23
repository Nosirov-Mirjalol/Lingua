import { useQuery } from '@tanstack/react-query'
import { fetchMyGroups } from '@/api/service/group/group-members.service'

export const MY_GROUPS_KEY = ['groups', 'my'] as const

/** GET /api/groups/my/ */
export function useMyGroups(enabled = true) {
  return useQuery({
    queryKey: MY_GROUPS_KEY,
    queryFn: () => fetchMyGroups(),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })
}
