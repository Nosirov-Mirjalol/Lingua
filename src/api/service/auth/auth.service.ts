import { apiClient, type ApiError } from '@/api/client'
import { normalizePhoneForApi } from '@/lib/phone'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  VerifyPasswordRequest,
} from './auth.type'
import { AUTH } from '@/constants/apiEndPoints'

/** POST /api/auth/login/ — Login schema */
export const loginService = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  return apiClient.post(AUTH.LOGIN, {
    username: data.username.trim(),
    password: data.password,
  })
}

/**
 * POST /api/auth/forgot-password/ — ForgotPasswordSerealizers
 * Amal 1: username + phone (telefon max 9 raqam, API Register bilan bir xil)
 */
export const forgotPasswordService = async (
  data: ForgotPasswordRequest
): Promise<void> => {
  const username = data.username.trim()
  const phone = normalizePhoneForApi(data.phone)

  if (username.length < 3) {
    throw {
      message: 'Foydalanuvchi nomi kamida 3 belgidan iborat bo\'lishi kerak',
      status: 400,
      success: false,
    } satisfies ApiError
  }

  if (phone.length !== 9) {
    throw {
      message: "Telefon raqamida +998 dan keyin 9 ta son bo'lsin",
      status: 400,
      success: false,
    } satisfies ApiError
  }

  await apiClient.post<void>(AUTH.FORGOT_PASSWORD, { username, phone })
}

/**
 * POST /api/auth/verfiy-password/ — VirfiyPasswordSerialezers
 * Amal 2: username + new_password + confirm_password
 */
export const verifyPasswordService = async (
  data: VerifyPasswordRequest
): Promise<void> => {
  await apiClient.post<void>(AUTH.VERIFY_PASSWORD, {
    username: data.username.trim(),
    new_password: data.new_password,
    confirm_password: data.confirm_password,
  })
}
