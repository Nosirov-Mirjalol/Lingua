import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { cn, sleep } from '@/lib/utils'
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
        "Parol 7 tadan 32 tagacha bo'lsin va bo'sh joy qatnashmasin"
      ),
    confirm_password: z
      .string()
      .min(1, 'Parolni qayta kiriting')
      .regex(
        PASSWORD_REGEX,
        "Parol 7 tadan 32 tagacha bo'lsin va bo'sh joy qatnashmasin"
      ),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Parollar bir xil emas',
    path: ['confirm_password'],
  })

export function VerifyPassword() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/(auth)/verify-page' })
  const [isLoading, setIsLoading] = useState(false)
  const focusInputStyle =
    'focus-visible:ring-[#C70C3D] focus-visible:ring-offset-0'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: search.username ?? '',
      new_password: '',
      confirm_password: '',
    },
  })  

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    toast.promise(sleep(2000), {
      loading: 'Parol yangilanmoqda...',
      success: () => {
        setIsLoading(false)
        form.reset({
          username: data.username,
          new_password: '',
          confirm_password: '',
        })
        navigate({ to: '/sign-in' })
        return 'Parol muvaffaqiyatli yangilandi'
      },
      error: () => {
        setIsLoading(false)
        return "Xatolik yuz berdi. Qayta urinib ko'ring."
      },
    })
  }

  return (
    <AuthCardShell
      title='Parolni yangilash'
      description="Foydalanuvchi nomi, yangi parol va qayta tasdiqlash maydonlarini to'ldiring."
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
                    {...field}
                    onChange={(e) =>
                      field.onChange(sanitizeUsername(e.target.value))
                    }
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
            className='mt-2 w-full bg-[#C70C3D] text-white transition-colors hover:bg-[#C70C3D]/90'
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Check className='mr-2 h-4 w-4' />
            )}
            Tasdiqlash
          </Button>
        </form>
      </Form>
    </AuthCardShell>
  )
}
