import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  deleteGroupMessage,
  getGroupMessages,
  getMessageGroups,
  getUnreadCount,
  sendGroupMessage,
  type SendMessagePayload,
} from '@/api/messages.api'

export const useMessageGroups = () => {
  return useQuery({
    queryKey: ['message-groups'],
    queryFn: getMessageGroups,
    refetchInterval: 30_000,
  })
}

export const useGroupMessages = (groupId: number) => {
  return useQuery({
    queryKey: ['group-messages', groupId],
    queryFn: () => getGroupMessages(groupId, 1, 50),
    enabled: !!groupId,
    refetchInterval: 10_000,
  })
}

export const useSendMessage = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => sendGroupMessage(groupId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] })
      await queryClient.invalidateQueries({ queryKey: ['message-groups'] })
    },
    onError: () => {
      toast.error('Xabar yuborilmadi')
    },
  })
}

export const useDeleteMessage = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId }: { messageId: number }) =>
      deleteGroupMessage(groupId, messageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] })
      await queryClient.invalidateQueries({ queryKey: ['message-groups'] })
    },
    onError: () => {
      toast.error("O'chirib bo'lmadi")
    },
  })
}

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  })
}
