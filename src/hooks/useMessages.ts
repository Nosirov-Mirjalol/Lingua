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
    onMutate: async ({ messageId }: { messageId: number }) => {
      await queryClient.cancelQueries({ queryKey: ['group-messages', groupId] })

      const previousMessages = queryClient.getQueryData<{ results: any[] }>([
        'group-messages',
        groupId,
      ])

      if (previousMessages) {
        queryClient.setQueryData(['group-messages', groupId], {
          ...previousMessages,
          results: previousMessages.results.filter(
            (message) => message.id !== messageId
          ),
        })
      }

      const toastId = toast.loading('Xabar o‘chirilyapti...')
      return { previousMessages, toastId }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['group-messages', groupId],
          context.previousMessages
        )
      }
      if (context?.toastId) {
        toast.error("O'chirib bo'lmadi", { id: context.toastId })
      } else {
        toast.error("O'chirib bo'lmadi")
      }
    },
    onSuccess: (_data, _variables, context) => {
      if (context?.toastId) {
        toast.success("Xabar o'chirildi", { id: context.toastId })
      } else {
        toast.success("Xabar o'chirildi")
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] })
      await queryClient.invalidateQueries({ queryKey: ['message-groups'] })
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
