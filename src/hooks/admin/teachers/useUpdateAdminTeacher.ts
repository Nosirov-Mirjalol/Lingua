import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  updateAdminTeacher,
  type AdminTeacherUpdatePayload,
} from '@/api/service/admin/teacher.service'

export const useUpdateAdminTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: AdminTeacherUpdatePayload
    }) => {
      console.log('Updating teacher:', id, data)
      return updateAdminTeacher(id, data)
    },
    onSuccess: async () => {
      console.log('Teacher update successful')
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'teachers', 'list'],
      })
    },
    onError: (error: unknown) => {
      console.error('Teacher update error:', error)
      toast.error((error as Error)?.message || 'Yangilashda xatolik')
    },
  })
}
