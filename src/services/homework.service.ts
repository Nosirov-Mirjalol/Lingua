<<<<<<< HEAD
import { client } from '@/api/client'
import { type Homework, type HomeworkMessage } from '@/types/student'
=======
import { apiClient } from '@/api/client'
import { Homework, HomeworkMessage } from '@/types/student'
>>>>>>> f625b1e03f99fb0e9fc0ac9a0f170c64aebab351

export const homeworkService = {
  getHomeworkList: async (): Promise<Homework[]> => {
    return await apiClient.get<Homework[]>('/api/student/homework')
  },
  getMessages: async (id: string): Promise<HomeworkMessage[]> => {
    return await apiClient.get<HomeworkMessage[]>(
      `/api/student/homework/${id}/messages`
    )
  },
  sendMessage: async (
    id: string,
    content: string
  ): Promise<HomeworkMessage> => {
    return await apiClient.post<HomeworkMessage>(
      `/api/student/homework/${id}/messages`,
      { content }
    )
  },
  submitHomework: async (id: string, file: File): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    await apiClient.post(`/api/student/homework/${id}/submit`, formData)
  },
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/student/homework/${id}/read`)
  },
}
