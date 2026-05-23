import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addStudentToAdminGroup } from '@/api/service/admin/group.service'
import { resetMyGroupsCache } from '@/api/service/group/group-members.service'
import type { AddStudentPayload } from '@/api/service/teacher/group.type'
import { MY_GROUPS_KEY } from '@/hooks/groups/useMyGroups'

export type AddStudentToGroupVariables = {
  payload: AddStudentPayload
}

export const useAdminAddStudentToGroup = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ payload }: AddStudentToGroupVariables) =>
      addStudentToAdminGroup(groupId, payload),
    onSuccess: async () => {
      resetMyGroupsCache()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MY_GROUPS_KEY }),
        queryClient.invalidateQueries({
          queryKey: ['admin', 'groups', groupId, 'enrolled'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['admin', 'groups', groupId, 'available-students'],
        }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'groups', 'list'] }),
      ])
    },
  })
}
