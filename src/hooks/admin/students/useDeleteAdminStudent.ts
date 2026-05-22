import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteAdminStudent } from '@/api/service/admin/student.service'

export const useDeleteAdminStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: number | string) => deleteAdminStudent(studentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'students'],
      })
    },
    onError: (error: unknown) => {
      toast.error((error as Error)?.message || "O'chirishda xatolik")
    },
  })
}
