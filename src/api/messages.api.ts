import { apiClient } from '@/api/client'
import { MESSAGES } from '@/constants/apiEndPoints'
import type { MessageGroup, MessagesResponse } from '@/types/messages'

export const getMessageGroups = (): Promise<MessageGroup[]> => {
  return apiClient.get<MessageGroup[]>(MESSAGES.GROUPS)
}

export const getGroupMessages = (
  groupId: number,
  page = 1,
  pageSize = 50
): Promise<MessagesResponse> => {
  return apiClient.get<MessagesResponse>(MESSAGES.GROUP_MESSAGES(groupId), {
    params: { page, page_size: pageSize },
  })
}

export type SendMessagePayload = {
  content: string
  image?: File
  attachment?: File
}

export const sendGroupMessage = (
  groupId: number,
  payload: SendMessagePayload
): Promise<unknown> => {
  const formData = new FormData()
  formData.append('content', payload.content)

  if (payload.image) formData.append('image', payload.image)
  if (payload.attachment) formData.append('attachment', payload.attachment)

  return apiClient.post(MESSAGES.SEND(groupId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteGroupMessage = (
  groupId: number,
  messageId: number
): Promise<unknown> => {
  return apiClient.delete(MESSAGES.DELETE(groupId, messageId))
}

export const getUnreadCount = (): Promise<{ unread_count: number }> => {
  return apiClient.get<{ unread_count: number }>(MESSAGES.UNREAD_COUNT)
}
