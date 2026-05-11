// profile.type.ts

export interface UserData {
  id: number
  role: string
  username: string
  full_name?: string | null
  phone: string | null
  avatar: string | null
  timezone: string
  bio: string
  learning_goal: string
  created_at: string
  updated_at: string
}

export interface ProfileResponse {
  'User Data': UserData
}

export interface UpdateProfileRequest {
  username?: string
  full_name?: string
  avatar?: string
  timezone?: string
  bio?: string
  learning_goal?: string
}

export interface UpdateProfileResponse {
  id: number
  username: string
  full_name?: string | null
  avatar: string
  timezone: string
  bio: string
  learning_goal: string
}
