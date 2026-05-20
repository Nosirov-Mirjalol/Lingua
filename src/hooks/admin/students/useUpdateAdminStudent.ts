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
    }) => {
      console.log('Updating student:', studentId, data)
      return updateAdminStudent(studentId, data)
    },
    onSuccess: async () => {
      console.log('Student update successful')
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'students', 'list'],
      })
    },
    onError: (error: unknown) => {
      console.error('Student update error:', error)
      toast.error(getStudentApiErrorMessage(error, 'Yangilashda xatolik'))
    },
  })
}
