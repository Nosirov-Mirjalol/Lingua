import type { StudentConversation } from '@/types/student'
import { MESSAGES } from '@/constants/apiEndPoints'
import { apiClient } from './client'

export const getAdminConversations = async (): Promise<
  StudentConversation[]
> => {
  return apiClient.get<StudentConversation[]>(MESSAGES.GROUPS)
}

export const getAdminConversationMessages = async (
  conversationId: number
): Promise<StudentConversation> => {
  return apiClient.get<StudentConversation>(
    MESSAGES.GROUP_MESSAGES(conversationId)
  )
}

export const sendAdminMessage = async (
  conversationId: number,
  message: string
): Promise<void> => {
  await apiClient.post(MESSAGES.SEND(conversationId), {
    content: message,
  })
}

export const markAdminConversationAsRead = async (
  conversationId: number
): Promise<void> => {
  await apiClient.post(MESSAGES.MARK_READ(conversationId))
}
