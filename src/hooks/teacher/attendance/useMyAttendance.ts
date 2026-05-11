import { useQuery } from '@tanstack/react-query'

import { getMyAttendance } from '@/api/service/teacher/attendance.service'

export const useMyAttendance = () => {
  return useQuery({
    queryKey: ['attendance', 'my'],
    queryFn: () => getMyAttendance(),
  })
}
