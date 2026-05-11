export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'teacher' | 'admin'
  phone?: string
  avatar?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserListResponse {
  count: number
  next: string | null
  previous: string | null
  results: User[]
}
