// profile.service.ts
import { apiClient } from '@/api/client'
import { AUTH } from '@/constants/apiEndPoints'
import type {
  ProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UserData,
} from './profile.type'

export const getProfile = async (): Promise<UserData> => {
  const res = await apiClient.get<ProfileResponse>(AUTH.PROFILE_GET)
  return res['User Data']
}

export const updateProfile = (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  return apiClient.put<UpdateProfileResponse>(AUTH.PROFILE_UPDATE, data)
}
