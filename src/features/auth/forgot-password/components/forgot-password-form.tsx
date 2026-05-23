import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useForgotPassword } from '@/hooks/auth/useForgotPassword'
import { getAuthErrorMessage } from '@/lib/auth-error-message'
import { readAuthUserHint } from '@/lib/auth-user-hint'
import { cn } from '@/lib/utils'
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
import {
  PHONE_DIGITS_REGEX,
  USERNAME_REGEX,
  formatPhoneDigits,
  normalizePhoneForApi,
  sanitizeUsername,
} from '../../validators'

const formSchema = z.object({
  username: z
    .string()
    .min(1, 'Foydalanuvchi nomini kiriting')
    .regex(
      USERNAME_REGEX,
      "Foydalanuvchi nomi 3 tadan 20 tagacha lotin harfi, raqam yoki pastki chiziqdan iborat bo'lsin"
    ),
  phone: z
    .string()
    .regex(PHONE_DIGITS_REGEX, "Telefon raqamida +998 dan keyin 9 ta son bo'lsin"),
})

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const forgotMutation = useForgotPassword()
  const submittedRef = useRef(false)
  const focusInputStyle =
    'focus-visible:ring-[#C70C3D] focus-visible:ring-offset-0'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      phone: '',
    },
  })

  useEffect(() => {
    const hint = readAuthUserHint()
    if (!hint) return

    if (!form.getValues('username')) {
      form.setValue('username', hint.username, { shouldValidate: false })
    }
    if (!form.getValues('phone') && hint.phone.length === 9) {
      form.setValue('phone', hint.phone, { shouldValidate: false })
    }
  }, [form])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (forgotMutation.isPending || submittedRef.current) return
    submittedRef.current = true

    try {
      await forgotMutation.mutateAsync({
        username: data.username.trim(),
        phone: data.phone,
      })
    } catch (err: unknown) {
      toast.error(
        getAuthErrorMessage(
          err,
          "Username yoki telefon noto'g'ri. Avval tizimga kirgan hisobingiz ma'lumotlarini kiriting."
        )
      )
    } finally {
      submittedRef.current = false
    }
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit(onSubmit)(e)
        }}
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
                  placeholder='Login qiladigan nomingiz'
                  autoComplete='username'
                  className={focusInputStyle}
                  maxLength={20}
                  disabled={forgotMutation.isPending}
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
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon raqami</FormLabel>
              <FormControl>
                <div className='flex items-center rounded-md border border-input bg-transparent shadow-xs transition-all focus-within:border-[#C70C3D] focus-within:ring-2 focus-within:ring-[#C70C3D]/30'>
                  <span className='border-r border-input px-3 text-sm font-medium text-foreground'>
                    +998
                  </span>
                  <Input
                    value={formatPhoneDigits(field.value)}
                    inputMode='numeric'
                    autoComplete='tel-national'
                    disabled={forgotMutation.isPending}
                    className={cn(
                      'border-0 shadow-none focus:border-0 focus:ring-0 focus-visible:ring-0',
                      focusInputStyle
                    )}
                    placeholder='88-348-34-34'
                    onChange={(e) =>
                      field.onChange(normalizePhoneForApi(e.target.value))
                    }
                  />
                </div>
              </FormControl>
              <FormMessage />
              <p className='text-xs text-muted-foreground'>
                API talabi: 9 raqam (masalan 883483434). Avval tizimga kirgan
                bo&apos;lsangiz, maydonlar avtomatik to&apos;ldiriladi.
              </p>
            </FormItem>
          )}
        />

        <Button
          type='submit'
          className='mt-2 w-full bg-[#C70C3D] text-white transition-colors hover:bg-[#C70C3D]/90'
          disabled={forgotMutation.isPending}
          aria-busy={forgotMutation.isPending}
        >
          {forgotMutation.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <ArrowRight className='mr-2 h-4 w-4' />
          )}
          {forgotMutation.isPending ? 'Tekshirilmoqda...' : 'Davom etish'}
        </Button>

        <p className='text-center text-sm text-muted-foreground'>
          <Link to='/sign-in' className='text-[#C70C3D] hover:underline'>
            Kirish sahifasiga qaytish
          </Link>
        </p>
      </form>
    </Form>
  )
}
