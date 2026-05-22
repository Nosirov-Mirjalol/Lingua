import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getStudentApiErrorMessage,
  updateAdminStudent,
  type AdminStudentCreatePayload,
} from '@/api/service/admin/student.service'

export const useUpdateAdminStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: number
      data: Partial<AdminStudentCreatePayload>
    }) => updateAdminStudent(studentId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'students', 'list'],
      })
    },
    onError: (error: unknown) => {
      toast.error(getStudentApiErrorMessage(error, 'Yangilashda xatolik'))
    },
  })
}
