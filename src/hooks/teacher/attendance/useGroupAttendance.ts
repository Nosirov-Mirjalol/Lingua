import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AttendanceGroupAttendanceRequest } from '@/api/service/teacher/attendance.type'
import { groupAttendance } from '@/api/service/teacher/attendance.service'

export const useGroupAttendance = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AttendanceGroupAttendanceRequest) =>
      groupAttendance(groupId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['attendance', 'list'] })
    },
  })
}
