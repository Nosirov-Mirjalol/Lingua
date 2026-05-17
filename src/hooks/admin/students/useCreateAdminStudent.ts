import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createAdminStudent,
  getStudentApiErrorMessage,
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
    },
  })
}

export function getCreateStudentErrorMessage(error: unknown): string {
  return getStudentApiErrorMessage(error, 'Student yaratishda xatolik')
}
