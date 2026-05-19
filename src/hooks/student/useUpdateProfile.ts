import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateStudentProfile } from '@/api/service/student/profile.service'
import type { UpdateProfileRequest } from '@/api/service/teacher/profile.type'

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateStudentProfile(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student', 'profile'] })
      toast.success('Profile successfully updated!')
    },
    onError: (error) => {
      console.error('Update student profile error:', error)
      toast.error('Failed to update profile. Please try again.')
    },
  })
}
