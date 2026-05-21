import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  updateAdminCourse,
  type AdminCourseUpdatePayload,
} from '@/api/service/admin/course.service'

export const useUpdateAdminCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: AdminCourseUpdatePayload
    }) => {
      console.log('Updating course:', id, data)
      return updateAdminCourse(id, data)
    },
    onSuccess: async () => {
      console.log('Course update successful')
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'courses', 'list'],
      })
    },
    onError: (error: unknown) => {
      console.error('Course update error:', error)
      toast.error((error as Error)?.message || 'Yangilashda xatolik')
    },
  })
}
