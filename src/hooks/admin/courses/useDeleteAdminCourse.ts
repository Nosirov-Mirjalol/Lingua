import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
    onError: (error: unknown) => {
      toast.error((error as Error)?.message || "O'chirishda xatolik")
    },
  })
}
