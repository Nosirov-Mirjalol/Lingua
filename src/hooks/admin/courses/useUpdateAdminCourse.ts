import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateAdminCourse,
  type AdminCourseUpdatePayload,
} from '@/api/service/admin/course.service'

export const useUpdateAdminCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminCourseUpdatePayload }) =>
      updateAdminCourse(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'courses', 'list'],
      })
    },
  })
}
