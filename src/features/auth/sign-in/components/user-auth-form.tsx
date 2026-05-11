import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { cn } from '@/lib/utils'
import { useLogin } from '@/hooks/auth/useLogin'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import {
  PASSWORD_REGEX,
  USERNAME_REGEX,
  sanitizePassword,
  sanitizeUsername,
} from '../../validators'

const formSchema = z.object({
  username: z
    .string()
    .min(1, 'Foydalanuvchi nomini kiritishingiz shart.')
    .regex(
      USERNAME_REGEX,
      "Foydalanuvchi nomi 3 tadan 20 tagacha lotin harfi, raqam yoki pastki chiziqdan iborat bo'lsin"
    ),
  password: z
    .string()
    .min(1, 'Parolni kiritishingiz shart.')
    .regex(
      PASSWORD_REGEX,
      "Parol 7 tadan 32 tagacha bo'lsin va bo'sh joy qatnashmasin"
    ),
})

type FormValues = z.infer<typeof formSchema>

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const loginMutation = useLogin({ redirectTo })

  const focusInputStyle = 'focus-visible:ring-[#C70C3D] focus-visible:ring-offset-0'

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  function onSubmit(data: FormValues) {
    toast.promise(loginMutation.mutateAsync(data), {
      loading: 'Tizimga kirilmoqda...',
      success: 'Xush kelibsiz!',
      error: (err: AxiosError<{ message?: string }>) =>
        err.response?.data?.message ?? "Login muvaffaqiyatsiz. Qayta urinib ko'ring.",
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foydalanuvchi nomi</FormLabel>
              <FormControl>
                <Input
                  placeholder='Foydalanuvchi nomini kiriting'
                  className={focusInputStyle}
                  maxLength={20}
                  {...field}
                  onChange={(e) => field.onChange(sanitizeUsername(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center justify-between'>
                <FormLabel>Parol</FormLabel>
                <Link
                  to='/forgot-password'
                  className='text-sm font-medium text-[#C70C3D] hover:underline'
                >
                  Parolni tiklash
                </Link>
              </div>
              <FormControl>
                <PasswordInput
                  placeholder='Parolni kiriting'
                  className={focusInputStyle}
                  maxLength={32}
                  {...field}
                  onChange={(e) => field.onChange(sanitizePassword(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className='mt-2 w-full bg-[#C70C3D] text-white transition-colors hover:bg-[#C70C3D]/90'
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <LogIn className='mr-2 h-4 w-4' />
          )}
          Tizimga kirish
        </Button>
      </form>
    </Form>
  )
}
