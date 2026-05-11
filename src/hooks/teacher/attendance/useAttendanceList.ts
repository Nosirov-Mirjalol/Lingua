import { useQuery } from '@tanstack/react-query'

import type { AttendanceListParams } from '@/api/service/teacher/attendance.type'
import { getAttendanceList } from '@/api/service/teacher/attendance.service'

export const useAttendanceList = (params?: AttendanceListParams) => {
  return useQuery({
    queryKey: ['attendance', 'list', params],
    queryFn: () => getAttendanceList(params),
  })
}
