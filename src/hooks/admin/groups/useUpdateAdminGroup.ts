import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  updateAdminGroup,
  type AdminGroupUpdatePayload,
} from '@/api/service/admin/group.service'

export const useUpdateAdminGroup = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminGroupUpdatePayload) => updateAdminGroup(groupId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'groups', 'list'] })
    },
  })
}
