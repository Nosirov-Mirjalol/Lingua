import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeStudentFromGroup } from '@/api/service/teacher/group.service'

export const useRemoveStudentFromGroup = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: number) =>
      removeStudentFromGroup(groupId, studentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teacher', 'groups'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] })
      await queryClient.invalidateQueries({
        queryKey: ['students', 'available', groupId],
      })
    },
  })
}
