import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AttendanceUpdateRequest } from '@/api/service/teacher/attendance.type'
import { updateAttendance } from '@/api/service/teacher/attendance.service'

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AttendanceUpdateRequest }) =>
      updateAttendance(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['attendance', 'list'] })
    },
  })
}
