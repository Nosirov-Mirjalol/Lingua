import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateProfile } from '@/api/service/teacher/profile.service'
import type { UpdateProfileRequest } from '@/api/service/teacher/profile.type'

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: async () => {
      // Profil yangilangandan so'ng yangi ma'lumotlarni darhol tortib keladi
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile successfully updated!')
    },
    onError: (error) => {
      console.error('Update Profile Error:', error)
      toast.error('Failed to update profile. Please try again.')
    },
  })
}