import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeStudentFromAdminGroup } from '@/api/service/admin/group.service'
import type { Group } from '@/api/service/teacher/group.type'

export const useAdminRemoveStudentFromGroup = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: number) =>
      removeStudentFromAdminGroup(groupId, studentId),
    onSuccess: (_res, studentId) => {
      queryClient.setQueryData<Group>(
        ['admin', 'groups', 'students', groupId],
        (old) =>
          old
            ? {
                ...old,
                students: old.students.filter((s) => s.student !== studentId),
              }
            : old
      )

      queryClient.setQueryData<Group[]>(['admin', 'groups', 'list'], (old) =>
        old?.map((g) =>
          g.id === groupId
            ? {
                ...g,
                students: g.students.filter((s) => s.student !== studentId),
              }
            : g
        )
      )

      void queryClient.invalidateQueries({
        queryKey: ['admin', 'groups', groupId, 'available-students'],
      })
    },
  })
}
