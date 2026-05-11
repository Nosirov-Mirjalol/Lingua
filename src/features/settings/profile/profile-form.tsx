import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  adminProfileStorageKey,
  sidebarData,
} from '@/components/layout/data/sidebar-data'

const profileFormSchema = z.object({
  name: z
    .string('Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name must not be longer than 50 characters.'),
  email: z.email({
    error: (iss: { input?: unknown }) =>
      iss.input === undefined ? 'Please enter an email.' : undefined,
  }),
  avatar: z.string().min(1, 'Please enter an avatar url.'),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const getInitialValues = (): ProfileFormValues => {
  try {
    const raw = localStorage.getItem(adminProfileStorageKey)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'name' in parsed &&
        'email' in parsed &&
        'avatar' in parsed
      ) {
        const u = parsed as { name: unknown; email: unknown; avatar: unknown }
        if (
          typeof u.name === 'string' &&
          typeof u.email === 'string' &&
          typeof u.avatar === 'string'
        ) {
          return { name: u.name, email: u.email, avatar: u.avatar }
        }
      }
    }
  } catch {
    // ignore
  }

  return {
    name: sidebarData.user.name,
    email: sidebarData.user.email,
    avatar: sidebarData.user.avatar,
  }
}

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: getInitialValues(),
    mode: 'onChange',
  })

  useEffect(() => {
    form.reset(getInitialValues())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          localStorage.setItem(adminProfileStorageKey, JSON.stringify(data))
          showSubmittedData(data)
          window.location.reload()
        })}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Admin name' {...field} />
              </FormControl>
              <FormDescription>
                This will be shown in the sidebar.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select an email to display' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='admin@linguapro.uz'>
                    admin@linguapro.uz
                  </SelectItem>
                  <SelectItem value='support@linguapro.uz'>
                    support@linguapro.uz
                  </SelectItem>
                  <SelectItem value='info@linguapro.uz'>
                    info@linguapro.uz
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                This will be shown in the sidebar.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='avatar'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input placeholder='/avatars/shadcn.jpg' {...field} />
              </FormControl>
              <FormDescription>
                You can use an URL or a local path.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Update profile</Button>
      </form>
    </Form>
  )
}
