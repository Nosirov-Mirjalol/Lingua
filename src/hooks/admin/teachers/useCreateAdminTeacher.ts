import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createAdminTeacher,
  type AdminTeacherCreatePayload,
} from '@/api/service/admin/teacher.service'

export const useCreateAdminTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminTeacherCreatePayload) => createAdminTeacher(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'teachers', 'list'] })
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as Error)?.message || 'Teacher yaratishda xatolik'
      toast.error(errorMessage)
    },
  })
}
