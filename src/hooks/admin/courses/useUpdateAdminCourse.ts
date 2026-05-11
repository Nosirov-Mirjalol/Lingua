import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateAdminCourse,
  type AdminCourseUpdatePayload,
} from '@/api/service/admin/course.service'

export const useUpdateAdminCourse = (courseId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminCourseUpdatePayload) =>
      updateAdminCourse(courseId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'courses', 'list'],
      })
    },
  })
}
