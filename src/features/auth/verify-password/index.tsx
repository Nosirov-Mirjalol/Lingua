import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useVerifyPassword } from '@/hooks/auth/useVerifyPassword'
import { getAuthErrorMessage } from '@/lib/auth-error-message'
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
import { cn } from '@/lib/utils'
import { AuthCardShell } from '../auth-card-shell'
import {
  PASSWORD_REGEX,
  USERNAME_REGEX,
  sanitizePassword,
  sanitizeUsername,
} from '../validators'

const formSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Foydalanuvchi nomini kiriting')
      .regex(
        USERNAME_REGEX,
        "Foydalanuvchi nomi 3 tadan 20 tagacha lotin harfi, raqam yoki pastki chiziqdan iborat bo'lsin"
      ),
    new_password: z
      .string()
      .min(1, 'Yangi parolni kiriting')
      .regex(
        PASSWORD_REGEX,
        "Parol 8 tadan 32 tagacha bo'lsin va bo'sh joy qatnashmasin"
      ),
    confirm_password: z
      .string()
      .min(1, 'Parolni qayta kiriting')
      .regex(
        PASSWORD_REGEX,
        "Parol 8 tadan 32 tagacha bo'lsin va bo'sh joy qatnashmasin"
      ),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Parollar bir xil emas',
    path: ['confirm_password'],
  })

export function VerifyPassword() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/(auth)/verify-page' })
  const verifyMutation = useVerifyPassword()
  const focusInputStyle =
    'focus-visible:ring-[#C70C3D] focus-visible:ring-offset-0'

  const usernameFromSearch = search.username?.trim() ?? ''

  useEffect(() => {
    if (!usernameFromSearch) {
      navigate({ to: '/forgot-password', replace: true })
    }
  }, [usernameFromSearch, navigate])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: usernameFromSearch,
      new_password: '',
      confirm_password: '',
    },
  })

  useEffect(() => {
    if (usernameFromSearch) {
      form.setValue('username', usernameFromSearch)
    }
  }, [usernameFromSearch, form])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await verifyMutation.mutateAsync({
        username: data.username.trim(),
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      })
    } catch (err: unknown) {
      toast.error(
        getAuthErrorMessage(err, "Xatolik yuz berdi. Qayta urinib ko'ring.")
      )
    }
  }

  if (!usernameFromSearch) {
    return null
  }

  return (
    <AuthCardShell
      title='Parolni yangilash'
      description="Yangi parolni kiriting va tasdiqlang."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('grid gap-4')}
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
                    readOnly
                    disabled
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='new_password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yangi parol</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder='Yangi parolni kiriting'
                    className={focusInputStyle}
                    maxLength={32}
                    disabled={verifyMutation.isPending}
                    {...field}
                    onChange={(e) =>
                      field.onChange(sanitizePassword(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirm_password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parolni qayta kiriting</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder='Parolni yana bir bor kiriting'
                    className={focusInputStyle}
                    maxLength={32}
                    disabled={verifyMutation.isPending}
                    {...field}
                    onChange={(e) =>
                      field.onChange(sanitizePassword(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            className='mt-2 w-full bg-[#C70C3D] text-white transition-colors hover:bg-[#C70C3D]/90'
            disabled={verifyMutation.isPending}
            aria-busy={verifyMutation.isPending}
          >
            {verifyMutation.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Check className='mr-2 h-4 w-4' />
            )}
            {verifyMutation.isPending ? 'Saqlanmoqda...' : 'Tasdiqlash'}
          </Button>

          <p className='text-center text-sm text-muted-foreground'>
            <Link to='/sign-in' className='text-[#C70C3D] hover:underline'>
              Kirish sahifasiga qaytish
            </Link>
          </p>
        </form>
      </Form>
    </AuthCardShell>
  )
}
