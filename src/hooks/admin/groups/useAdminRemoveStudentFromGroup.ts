import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeStudentFromAdminGroup } from '@/api/service/admin/group.service'
import { resetMyGroupsCache } from '@/api/service/group/group-members.service'
import { MY_GROUPS_KEY } from '@/hooks/groups/useMyGroups'

export const useAdminRemoveStudentFromGroup = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentUserId: number) =>
      removeStudentFromAdminGroup(groupId, studentUserId),
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
