import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AttendanceCreateRequest } from '@/api/service/teacher/attendance.type'
import { createAttendance } from '@/api/service/teacher/attendance.service'

export const useCreateAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AttendanceCreateRequest) => createAttendance(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['attendance', 'list'] })
    },
  })
}
