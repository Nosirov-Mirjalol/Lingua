import { useQuery } from '@tanstack/react-query'

import { getUsers } from '@/api/service/teacher/user.service'

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users', 'list'],
    queryFn: () => getUsers(),
  })
}
