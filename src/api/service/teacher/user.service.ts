import { apiClient } from '@/api/client'
import { AUTH } from '@/constants/apiEndPoints'
import type { UserListResponse } from './user.type'

export const getUsers = (): Promise<UserListResponse> => {
  return apiClient.get<UserListResponse>(AUTH.USER_LIST)
}
