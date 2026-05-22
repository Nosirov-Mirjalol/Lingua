import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createAdminCourse,
  type AdminCourse,
  type AdminCourseCreatePayload,
} from '@/api/service/admin/course.service'

function mergeCourseIntoList(
  list: AdminCourse[] | undefined,
  course: AdminCourse
): AdminCourse[] {
  if (!list?.length) return [course]
  const idx = list.findIndex((c) => c.id === course.id)
  if (idx < 0) return [course, ...list]
  const next = [...list]
  next[idx] = { ...next[idx], ...course, image: course.image ?? next[idx].image }
  return next
}

export const useCreateAdminCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminCourseCreatePayload) => createAdminCourse(data),
    onSuccess: (created, variables) => {
      const withPreview =
        !created.image && variables.image
          ? {
              ...created,
              image: URL.createObjectURL(variables.image),
            }
          : created

      queryClient.setQueriesData<AdminCourse[]>(
        { queryKey: ['admin', 'courses', 'list'] },
        (old) => mergeCourseIntoList(old, withPreview)
      )
    },
  })
}
