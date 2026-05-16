import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateAdminTeacher,
  type AdminTeacherUpdatePayload,
} from '@/api/service/admin/teacher.service'

export const useUpdateAdminTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminTeacherUpdatePayload }) =>
      updateAdminTeacher(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'teachers', 'list'] })
    },
  })
}
