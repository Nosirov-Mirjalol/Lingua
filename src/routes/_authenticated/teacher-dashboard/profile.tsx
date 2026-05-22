import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2, Save } from 'lucide-react'
import { useProfile } from '@/hooks/teacher/profile/useProfile'
import { useUpdateProfile } from '@/hooks/teacher/profile/useUpdateProfile'
import { Input } from '@/components/ui/input'
import { RoseButton } from '@/components/ui/rose-button'
import { Textarea } from '@/components/ui/textarea'
import { ProfileAvatar } from '@/components/shared/profile-avatar'

export const Route = createFileRoute(
  '/_authenticated/teacher-dashboard/profile'
)({
  component: ProfilePage,
})

type ProfileForm = {
  full_name: string
  username: string
  avatar: string
  timezone: string
  bio: string
  learning_goal: string
}

function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile()
  const updateProfileMutation = useUpdateProfile()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty, errors },
  } = useForm<ProfileForm>({
    mode: 'onBlur',
  })

  // Ma'lumotlar kelganda formani to'ldirish
  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        username: profile.username || '',
        avatar: profile.avatar || '',
        timezone: profile.timezone || 'Asia/Tashkent',
        bio: profile.bio || '',
        learning_goal: profile.learning_goal || '',
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileForm) => {
    const formData = new FormData()

    // Matnli maydonlarni qo'shish
    formData.append('full_name', data.full_name)
    formData.append('username', data.username)
    formData.append('timezone', data.timezone)
    formData.append('bio', data.bio)
    formData.append('learning_goal', data.learning_goal)

    // Agar yangi avatar tanlangan bo'lsa, uni fayl sifatida qo'shamiz
    if (selectedFile) {
      formData.append('avatar', selectedFile)
    }

    // Mutatsiyani chaqirish
    updateProfileMutation.mutate(formData as any, {
      onSuccess: () => {
        setSelectedFile(null)
      },
    })
  }

  if (isLoading) {
    return (
      <div className='flex min-h-100 items-center justify-center'>
        <Loader2 className='animate-spin text-rose-500' size={40} />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className='m-4 rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600'>
        Failed to load profile. Please try again later.
      </div>
    )
  }

  const isFormDisabled = updateProfileMutation.isPending

  return (
    <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
          My Profile
        </h1>
        <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
          Update your personal details and public profile.
        </p>
      </div>

      <div className='flex flex-col gap-8 md:flex-row'>
        {/* Chap ustun: Avatar */}
        <div className='w-full md:w-1/3 lg:w-1/4'>
          <div className='flex flex-col items-center rounded-xl border border-slate-200 bg-card p-6 text-card-foreground shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <ProfileAvatar
              avatarUrl={profile.avatar}
              name={profile.full_name || profile.username}
              role="Teacher"
              onFileSelect={setSelectedFile}
              isPending={isFormDisabled}
              size="lg"
            />
          </div>
        </div>

        {/* O'ng ustun: Forma */}
        <div className='w-full md:w-2/3 lg:w-3/4'>
          <div className='rounded-xl border border-slate-200 bg-card text-card-foreground shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <form
              id='profile-form'
              onSubmit={handleSubmit(onSubmit)}
              className='space-y-6 p-6 sm:p-8'
            >
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300'>
                    Full name
                  </label>
                  <Input
                    {...register('full_name', {
                      required: 'Full name is required',
                    })}
                    placeholder='e.g. John Doe'
                    disabled={isFormDisabled}
                  />
                  {errors.full_name && (
                    <p className='text-[0.8rem] text-destructive'>
                      {errors.full_name.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <label className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300'>
                    Username
                  </label>
                  <Input
                    {...register('username', {
                      required: 'Username is required',
                    })}
                    placeholder='e.g. john_doe'
                    disabled={isFormDisabled}
                  />
                  {errors.username && (
                    <p className='text-[0.8rem] text-destructive'>
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <label className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300'>
                    Timezone
                  </label>

                  <Input
                    {...register('timezone', {
                      required: 'Timezone is required',
                    })}
                    placeholder='continent/city'
                    disabled={isFormDisabled}
                    defaultValue={profile?.timezone || 'Asia/Tashkent'}
                    onChange={(e) =>
                      setValue('timezone', e.target.value, {
                        shouldDirty: true,
                      })
                    }
                  />

                  {errors.timezone && (
                    <p className='text-[0.8rem] text-destructive'>
                      {errors.timezone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300'>
                  Bio
                </label>
                <Textarea
                  {...register('bio')}
                  rows={4}
                  placeholder='Write a short introduction...'
                  disabled={isFormDisabled}
                  className='resize-none'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300'>
                  Teaching / Learning Goal
                </label>
                <Textarea
                  {...register('learning_goal')}
                  rows={3}
                  placeholder='What are your main goals?'
                  disabled={isFormDisabled}
                  className='resize-none'
                />
              </div>

              <div className='flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800'>
                <RoseButton
                  type='submit'
                  form='profile-form'
                  disabled={(!isDirty && !selectedFile) || isFormDisabled}
                  className='w-full sm:w-auto'
                >
                  {isFormDisabled ? (
                    <>
                      <Loader2 size={16} className='mr-2 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className='mr-2' />
                      Save Changes
                    </>
                  )}
                </RoseButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
