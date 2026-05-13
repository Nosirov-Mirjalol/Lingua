import { useQuery } from '@tanstack/react-query'
import { getMyGroups } from '@/api/service/student/group.service'

export const useMyGroups = () => {
  return useQuery({
    queryKey: ['my-groups'],
    queryFn: getMyGroups,
  })
}
