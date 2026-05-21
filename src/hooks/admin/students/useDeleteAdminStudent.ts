import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  deleteAdminStudent,
  getStudentApiErrorMessage,
} from '@/api/service/admin/student.service'

export const useDeleteAdminStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: number) => {
      console.log('Deleting student:', studentId)
      return deleteAdminStudent(studentId)
    },
    onSuccess: async () => {
      console.log('Student delete successful')
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'students', 'list'],
      })
    },
    onError: (error: unknown) => {
      console.error('Student delete error:', error)
      toast.error(getStudentApiErrorMessage(error, "O'chirishda xatolik"))
    },
  })
}
