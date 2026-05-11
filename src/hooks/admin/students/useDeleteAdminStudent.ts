import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteAdminStudent } from '@/api/service/admin/student.service'

export const useDeleteAdminStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: number) => deleteAdminStudent(studentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'students', 'list'],
      })
    },
  })
}
