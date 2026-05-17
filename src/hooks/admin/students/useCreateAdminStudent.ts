import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createAdminStudent,
  type AdminStudentCreatePayload,
} from '@/api/service/admin/student.service'

export const useCreateAdminStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminStudentCreatePayload) => createAdminStudent(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'students', 'list'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['student', 'profile'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['student', 'dashboard'],
      })
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as Error)?.message || 'Student yaratishda xatolik'
      toast.error(errorMessage)
    },
  })
}
