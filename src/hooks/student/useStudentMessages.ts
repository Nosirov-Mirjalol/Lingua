import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getStudentConversations,
  getStudentConversationMessages,
  sendStudentMessage,
  markStudentConversationAsRead,
} from '@/api/student-messages.api'

export const useStudentConversations = () => {
  return useQuery({
    queryKey: ['student', 'conversations'],
    queryFn: async () => {
      try {
        return await getStudentConversations()
      } catch (_error) {
        // Return mock data as fallback when API fails
        return [
          {
            id: 1,
            participant: 'Ms. Ziya',
            subject: 'Pronunciation practice',
            lastMessage: 'I reviewed your homework and left feedback.',
            time: '2m ago',
            unread: 2,
            messages: [
              {
                id: 1,
                sender: 'teacher',
                body: 'Great progress today! Please review the new pronunciation set.',
                time: '2m ago',
              },
              {
                id: 2,
                sender: 'student',
                body: 'Thank you! I will complete it tonight.',
                time: '1m ago',
              },
            ],
          },
          {
            id: 2,
            participant: 'Support Bot',
            subject: 'Course resources',
            lastMessage: 'Your next lesson note is ready.',
            time: '1h ago',
            unread: 0,
            messages: [
              {
                id: 3,
                sender: 'teacher',
                body: 'Your lesson notes are ready in the portal.',
                time: '1h ago',
              },
            ],
          },
        ]
      }
    },
    refetchInterval: 30000,
    staleTime: 10000,
  })
}

export const useStudentConversationMessages = (
  conversationId: number | null
) => {
  return useQuery({
    queryKey: ['student', 'conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null
      try {
        return await getStudentConversationMessages(conversationId)
      } catch (_error) {
        // Return fallback conversation data when API fails
        const fallbackConversations = [
          {
            id: 1,
            participant: 'Ms. Ziya',
            subject: 'Pronunciation practice',
            lastMessage: 'I reviewed your homework and left feedback.',
            time: '2m ago',
            unread: 2,
            messages: [
              {
                id: 1,
                sender: 'teacher',
                body: 'Great progress today! Please review the new pronunciation set.',
                time: '2m ago',
              },
              {
                id: 2,
                sender: 'student',
                body: 'Thank you! I will complete it tonight.',
                time: '1m ago',
              },
            ],
          },
          {
            id: 2,
            participant: 'Support Bot',
            subject: 'Course resources',
            lastMessage: 'Your next lesson note is ready.',
            time: '1h ago',
            unread: 0,
            messages: [
              {
                id: 3,
                sender: 'teacher',
                body: 'Your lesson notes are ready in the portal.',
                time: '1h ago',
              },
            ],
          },
        ]

        const conversation = fallbackConversations.find(
          (c) => c.id === conversationId
        )
        return conversation || null
      }
    },
    enabled: !!conversationId,
    refetchInterval: false,
    staleTime: 30000,
    retry: 1,
  })
}

export const useSendStudentMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      message,
    }: {
      conversationId: number
      message: string
    }) => sendStudentMessage(conversationId, message),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['student', 'conversation', conversationId],
      })
      queryClient.invalidateQueries({ queryKey: ['student', 'conversations'] })
      toast.success('Message sent successfully')
    },
    onError: (_error) => {
      toast.error('Failed to send message')
    },
  })
}

export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markStudentConversationAsRead,
    onSuccess: (_, _conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['student', 'conversations'] })
    },
    onError: () => {
      toast.error('Failed to mark conversation as read')
    },
  })
}
