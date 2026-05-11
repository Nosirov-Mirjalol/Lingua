import { client } from '@/api/client'
import { Homework, HomeworkMessage } from '@/types/student'

export const homeworkService = {
  getHomeworkList: async (): Promise<Homework[]> => {
    const { data } = await client.get('/api/student/homework')
    return data
  },
  getMessages: async (id: string): Promise<HomeworkMessage[]> => {
    const { data } = await client.get(`/api/student/homework/${id}/messages`)
    return data
  },
  sendMessage: async (id: string, content: string): Promise<HomeworkMessage> => {
    const { data } = await client.post(`/api/student/homework/${id}/messages`, { content })
    return data
  },
  submitHomework: async (id: string, file: File): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    await client.post(`/api/student/homework/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  markAsRead: async (id: string): Promise<void> => {
    await client.patch(`/api/student/homework/${id}/read`)
  },
}
