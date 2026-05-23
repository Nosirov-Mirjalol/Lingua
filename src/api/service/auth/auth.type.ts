export interface LoginRequest {
  username: string
  password: string
}
export interface LoginResponse {
  message: string
  user: UserProfile
  tokens: TokenPair
}
export interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  role: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenPair {
  refresh: string
  access: string
}

export interface ForgotPasswordRequest {
  username: string
  phone: string
}

export interface VerifyPasswordRequest {
  username: string
  new_password: string
  confirm_password: string
}
