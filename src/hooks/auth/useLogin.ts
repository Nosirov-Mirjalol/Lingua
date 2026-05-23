import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ApiError } from '@/api/client'
import { loginService } from '@/api/service/auth/auth.service'
import type { LoginRequest, LoginResponse } from '@/api/service/auth/auth.type'
import { saveAuthUserHint } from '@/lib/auth-user-hint'
import { getDefaultRouteForRole, normalizeUserRole } from '@/lib/auth-role'
import { queueLoginSuccessToast } from '@/lib/login-feedback'
import useUserStore, { type UserInfo } from '@/stores/userStore'
import { useAuthStore } from '@/stores/auth-store'

type UseLoginOptions = {
  redirectTo?: string
}

export const useLogin = ({ redirectTo }: UseLoginOptions = {}) => {
  const navigate = useNavigate()

  return useMutation<LoginResponse & { status?: number }, ApiError, LoginRequest>({
    mutationFn: async (credentials) => {
      const response = await loginService(credentials)
      return { ...response, status: 200 }
    },
    onSuccess: async (data) => {
      const normalizedRole = normalizeUserRole(data.user.role)
      const storedUser = {
        ...data.user,
        role: normalizedRole ?? data.user.role,
      }

      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)
      localStorage.setItem('user', JSON.stringify(storedUser))
      saveAuthUserHint(storedUser)

      sessionStorage.setItem('linguapro_user', JSON.stringify(storedUser))
      sessionStorage.setItem('linguapro_access_token', data.tokens.access)

      useUserStore.getState().actions.setUserToken({
        accessToken: data.tokens.access,
        refreshToken: data.tokens.refresh,
      })
      useUserStore
        .getState()
        .actions.setUserInfo({
          ...storedUser,
          roles: [normalizedRole ?? String(data.user.role)], // Set roles array for useAuthCheck hook
        } as unknown as UserInfo)

      // Sync with useAuthStore
      useAuthStore.getState().auth.setUser({
        accountNo: String(storedUser.id),
        email: storedUser.username,
        role: normalizedRole ?? 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      useAuthStore.getState().auth.setAccessToken(data.tokens.access)

      let to = redirectTo || getDefaultRouteForRole(normalizedRole)

      if (redirectTo) {
        if (normalizedRole === 'teacher' && !redirectTo.startsWith('/teacher-dashboard')) {
          to = getDefaultRouteForRole(normalizedRole)
        } else if (normalizedRole === 'student' && !redirectTo.startsWith('/student')) {
          to = getDefaultRouteForRole(normalizedRole)
        } else if (normalizedRole === 'admin' && (redirectTo.startsWith('/teacher-dashboard') || redirectTo.startsWith('/student'))) {
          to = getDefaultRouteForRole(normalizedRole)
        }
      }

      queueLoginSuccessToast({
        role: normalizedRole,
      })

      await navigate({ to, replace: true })
    },
  })
}
