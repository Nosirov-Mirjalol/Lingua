import { apiClient } from '@/api/client'
import { AUTH } from '@/constants/apiEndPoints'
import type {
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '@/api/service/teacher/profile.type'

export const updateStudentProfile = (
  data: UpdateProfileRequest | FormData
): Promise<UpdateProfileResponse> => {
  return apiClient.put<UpdateProfileResponse>(AUTH.PROFILE_UPDATE, data)
}
