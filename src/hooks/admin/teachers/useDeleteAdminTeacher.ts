import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteAdminTeacher } from '@/api/service/admin/teacher.service'

export const useDeleteAdminTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (teacherId: number) => {
      console.log('Deleting teacher:', teacherId)
      return deleteAdminTeacher(teacherId)
    },
    onSuccess: async () => {
      console.log('Teacher delete successful')
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'teachers', 'list'],
      })
    },
    onError: (error: unknown) => {
      console.error('Teacher delete error:', error)
      toast.error((error as Error)?.message || "O'chirishda xatolik")
    },
  })
}
