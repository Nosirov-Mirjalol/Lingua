import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteAdminGroup } from '@/api/service/admin/group.service'

export const useDeleteAdminGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (groupId: number) => deleteAdminGroup(groupId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'groups', 'list'] })
    },
  })
}
