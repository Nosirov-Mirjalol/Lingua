import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AttendanceBulkUpdateRequest } from '@/api/service/teacher/attendance.type'
import { bulkUpdateAttendance } from '@/api/service/teacher/attendance.service'

export const useBulkUpdateAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AttendanceBulkUpdateRequest) => bulkUpdateAttendance(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['attendance', 'list'] })
    },
  })
}
