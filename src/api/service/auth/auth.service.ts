import { apiClient } from '@/api/client'
import type { LoginRequest, LoginResponse } from './auth.type'
import { AUTH } from '@/constants/apiEndPoints'
export const loginService = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  return apiClient.post(AUTH.LOGIN, data)
}
