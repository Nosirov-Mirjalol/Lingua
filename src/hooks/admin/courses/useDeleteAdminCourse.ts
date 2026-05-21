import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteAdminCourse } from '@/api/service/admin/course.service'

export const useDeleteAdminCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: number) => {
      console.log('Deleting course:', courseId)
      return deleteAdminCourse(courseId)
    },
    onSuccess: async () => {
      console.log('Course delete successful')
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'courses', 'list'],
      })
    },
    onError: (error: unknown) => {
      console.error('Course delete error:', error)
      toast.error((error as Error)?.message || "O'chirishda xatolik")
    },
  })
}
