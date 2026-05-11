import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
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
  sanitizePhoneDigits,
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
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const focusInputStyle =
    'focus-visible:ring-[#C70C3D] focus-visible:ring-offset-0'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      phone: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const fullPhoneNumber = `+998${data.phone}`

    navigate({
      to: '/verify-page',
      search: { username: data.username },
    })

    // Keyingi API yuborishda telefon shu ko'rinishda ishlatiladi: +998901234567
    void fullPhoneNumber
    setIsLoading(false)
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
                    className={cn(
                      'border-0 shadow-none focus:border-0 focus:ring-0 focus-visible:ring-0',
                      focusInputStyle
                    )}
                    placeholder='90-123-45-67'
                    onChange={(e) =>
                      field.onChange(sanitizePhoneDigits(e.target.value))
                    }
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          className='mt-2 w-full bg-[#C70C3D] text-white transition-colors hover:bg-[#C70C3D]/90'
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <ArrowRight className='mr-2 h-4 w-4' />
          )}
          Davom etish
        </Button>
      </form>
    </Form>
  )
}
