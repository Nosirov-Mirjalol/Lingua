import type { AppUserRole } from './auth-role'

const LOGIN_SUCCESS_TOAST_KEY = 'linguapro_login_success_toast'

type LoginSuccessToastPayload = {
  role: AppUserRole | null
}

export function queueLoginSuccessToast(payload: LoginSuccessToastPayload) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(LOGIN_SUCCESS_TOAST_KEY, JSON.stringify(payload))
}

export function consumeLoginSuccessToast() {
  if (typeof window === 'undefined') return null

  const raw = sessionStorage.getItem(LOGIN_SUCCESS_TOAST_KEY)
  if (!raw) return null

  sessionStorage.removeItem(LOGIN_SUCCESS_TOAST_KEY)

  try {
    JSON.parse(raw) as LoginSuccessToastPayload
    return { title: 'Xush kelibsiz' }
  } catch {
    return { title: 'Xush kelibsiz' }
  }
}
