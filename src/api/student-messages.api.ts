import type { StudentConversation } from '@/types/student'
import { apiClient } from './client'

export const getStudentConversations = async (): Promise<
  StudentConversation[]
> => {
  const response = await apiClient.get('/api/messages')
  return response.data as StudentConversation[]
}

export const getStudentConversationMessages = async (
  conversationId: number
): Promise<StudentConversation> => {
  const response = await apiClient.get(`/api/messages/${conversationId}`)
  return response.data as StudentConversation
}

export const sendStudentMessage = async (
  conversationId: number,
  message: string
): Promise<void> => {
  await apiClient.post(`/api/messages/${conversationId}`, {
    body: message,
  })
}

export const markStudentConversationAsRead = async (
  conversationId: number
): Promise<void> => {
  await apiClient.post(`/api/messages/${conversationId}/read`)
}
