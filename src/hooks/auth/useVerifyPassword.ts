import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { ApiError } from '@/api/client'
import { verifyPasswordService } from '@/api/service/auth/auth.service'
import type { VerifyPasswordRequest } from '@/api/service/auth/auth.type'

export const useVerifyPassword = () => {
  const navigate = useNavigate()

  return useMutation<void, ApiError, VerifyPasswordRequest>({
    mutationFn: verifyPasswordService,
    retry: false,
    meta: { suppressGlobalErrorHandler: true },
    onSuccess: async () => {
      toast.success('Parol muvaffaqiyatli yangilandi. Tizimga kiring.')
      await navigate({ to: '/sign-in', replace: true })
    },
  })
}
