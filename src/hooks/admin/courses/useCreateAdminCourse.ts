import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createAdminCourse,
  type AdminCourseCreatePayload,
} from '@/api/service/admin/course.service'

export const useCreateAdminCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminCourseCreatePayload) => createAdminCourse(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'courses', 'list'],
      })
    },
  })
}
