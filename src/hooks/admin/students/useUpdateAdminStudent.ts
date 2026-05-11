import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  updateAdminStudent,
  type AdminStudentUpdatePayload,
} from '@/api/service/admin/student.service'

export const useUpdateAdminStudent = (studentId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminStudentUpdatePayload) => updateAdminStudent(studentId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'students', 'list'],
      })
    },
  })
}
