import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { VerifyPassword } from '@/features/auth/verify-password'

const searchSchema = z.object({
  username: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/verify-page')({
  component: VerifyPassword,
  validateSearch: searchSchema,
})
