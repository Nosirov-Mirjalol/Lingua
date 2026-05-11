import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createAdminGroup,
  type AdminGroupCreatePayload,
} from '@/api/service/admin/group.service'

export const useCreateAdminGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminGroupCreatePayload) => createAdminGroup(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'groups', 'list'],
      })
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as Error)?.message || 'Guruh yaratishda xatolik'
      toast.error(errorMessage)
    },
  })
}
