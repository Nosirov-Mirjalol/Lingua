import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  updateAdminGroup,
  type AdminGroupUpdatePayload,
} from '@/api/service/admin/group.service'

export const useUpdateAdminGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminGroupUpdatePayload }) =>
      updateAdminGroup(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'groups', 'list'] })
    },
  })
}
