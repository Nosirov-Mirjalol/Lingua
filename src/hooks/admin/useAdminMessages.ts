import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAdminConversationMessages,
  getAdminConversations,
  markAdminConversationAsRead,
  sendAdminMessage,
} from '@/api/admin-messages.api'

export const useAdminConversations = () => {
  return useQuery({
    queryKey: ['admin', 'conversations'],
    queryFn: async () => {
      return await getAdminConversations()
    },
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 1,
  })
}

export const useAdminConversationMessages = (conversationId: number | null) => {
  return useQuery({
    queryKey: ['admin', 'conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null
      return await getAdminConversationMessages(conversationId)
    },
    enabled: !!conversationId,
    refetchInterval: false,
    staleTime: 30000,
    retry: 1,
  })
}

export const useSendAdminMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      conversationId,
      message,
    }: {
      conversationId: number
      message: string
    }) => sendAdminMessage(conversationId, message),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'conversation', conversationId],
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'conversations'] })
      toast.success('Message sent successfully')
    },
    onError: (_error) => {
      toast.error('Failed to send message')
    },
  })
}

export const useMarkAdminConversationAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAdminConversationAsRead,
    onSuccess: (_, _conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'conversations'] })
    },
    onError: () => {
      toast.error('Failed to mark conversation as read')
    },
  })
}
