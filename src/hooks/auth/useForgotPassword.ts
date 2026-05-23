import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { ApiError } from '@/api/client'
import { forgotPasswordService } from '@/api/service/auth/auth.service'
import type { ForgotPasswordRequest } from '@/api/service/auth/auth.type'

export const useForgotPassword = () => {
  const navigate = useNavigate()

  return useMutation<void, ApiError, ForgotPasswordRequest>({
    mutationFn: forgotPasswordService,
    retry: false,
    meta: { suppressGlobalErrorHandler: true },
    onSuccess: (_data, variables) => {
      toast.success("Ma'lumotlar tasdiqlandi. Yangi parolni kiriting.")
      navigate({
        to: '/verify-page',
        search: { username: variables.username.trim() },
      })
    },
  })
}
