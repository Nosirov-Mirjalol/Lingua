import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAdminCourse } from '@/api/service/admin/course.service'

export const useDeleteAdminCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: number) => deleteAdminCourse(courseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'courses', 'list'],
      })
    },
  })
}
