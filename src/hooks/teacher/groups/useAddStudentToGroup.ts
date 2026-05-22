import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addStudentToGroup } from '@/api/service/teacher/group.service'
import type { AddStudentPayload } from '@/api/service/teacher/group.type'

export const useAddStudentToGroup = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddStudentPayload) => addStudentToGroup(groupId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teacher', 'groups'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] })
      await queryClient.invalidateQueries({
        queryKey: ['students', 'available', groupId],
      })
    },
  })
}
