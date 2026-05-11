import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateAdminTeacher,
  type AdminTeacherUpdatePayload,
} from '@/api/service/admin/teacher.service'

export const useUpdateAdminTeacher = (teacherId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminTeacherUpdatePayload) => updateAdminTeacher(teacherId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'teachers', 'list'] })
    },
  })
}
