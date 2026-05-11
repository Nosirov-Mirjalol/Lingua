import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/api/service/teacher/profile.service'

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })
}
