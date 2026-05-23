import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteAdminTeacher } from '@/api/service/admin/teacher.service'

export const useDeleteAdminTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (teacherId: number) => deleteAdminTeacher(teacherId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'teachers', 'list'],
      })
    },
    onError: (error: unknown) => {
      toast.error((error as Error)?.message || "O'chirishda xatolik")
    },
  })
}
