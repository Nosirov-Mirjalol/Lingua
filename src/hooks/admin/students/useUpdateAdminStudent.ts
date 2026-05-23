import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateAdminStudent,
  type AdminStudentUpdatePayload,
} from '@/api/service/admin/student.service'

export const useUpdateAdminStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: number
      data: AdminStudentUpdatePayload
    }) => updateAdminStudent(studentId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'students'],
        refetchType: 'active',
      })
    },
  })
}
