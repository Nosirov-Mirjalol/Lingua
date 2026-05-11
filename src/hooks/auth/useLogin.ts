import type { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { loginService } from '@/api/service/auth/auth.service'
import type { LoginResponse } from '@/api/service/auth/auth.type'
import useUserStore, { type UserInfo } from '@/stores/userStore'
import { useAuthStore } from '@/stores/auth-store'

type UseLoginOptions = {
  redirectTo?: string
}

export const useLogin = ({ redirectTo }: UseLoginOptions = {}) => {
  const navigate = useNavigate()

  return useMutation<LoginResponse & { status?: number }, AxiosError, any>({
    mutationFn: async (credentials) => {
      const response = await loginService(credentials)
      return { ...response, status: 200 }
    },
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)
      localStorage.setItem('user', JSON.stringify(data.user))

      sessionStorage.setItem('linguapro_user', JSON.stringify(data.user))
      sessionStorage.setItem('linguapro_access_token', data.tokens.access)

      useUserStore.getState().actions.setUserToken({
        accessToken: data.tokens.access,
        refreshToken: data.tokens.refresh,
      })
      useUserStore
        .getState()
        .actions.setUserInfo({
          ...data.user,
          roles: [data.user.role], // Set roles array for useAuthCheck hook
        } as unknown as UserInfo)

      // Sync with useAuthStore
      useAuthStore.getState().auth.setUser({
        accountNo: String(data.user.id),
        email: data.user.username,
        role: data.user.role as 'admin' | 'teacher' | 'student' | 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      useAuthStore.getState().auth.setAccessToken(data.tokens.access)

      const to =
        redirectTo ||
        (data.user.role === 'teacher'
          ? '/teacher-dashboard'
          : data.user.role === 'admin'
          ? '/admin-dashboard'
          : '/student')
      
      navigate({ to, replace: true })
    },
  })
}
