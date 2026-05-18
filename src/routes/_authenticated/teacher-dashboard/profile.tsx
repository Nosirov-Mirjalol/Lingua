import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2, Save, Camera, User } from 'lucide-react'
import { useProfile } from '@/hooks/teacher/profile/useProfile'
import { useUpdateProfile } from '@/hooks/teacher/profile/useUpdateProfile'
import { Input } from '@/components/ui/input'
// Shadcn Textarea qo'shildi
import { RoseButton } from '@/components/ui/rose-button'
import { Textarea } from '@/components/ui/textarea'

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

// Uploadcare Hook
const useUploadAvatar = () => {
  const [isUploading, setIsUploading] = useState(false)

  const uploadToUploadcare = async (file: File): Promise<string> => {
    setIsUploading(true)
    try {
      const pubKey = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY
      if (!pubKey) throw new Error('VITE_UPLOADCARE_PUBLIC_KEY topilmadi!')

      const formData = new FormData()
      formData.append('UPLOADCARE_PUB_KEY', pubKey)
      formData.append('UPLOADCARE_STORE', 'auto')
      formData.append('file', file)

      const res = await fetch('https://upload.uploadcare.com/base/', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!data.file) throw new Error('Uploadcare xatosi yuz berdi')

      return `https://4yypsqu6p6.ucarecd.net/${data.file}/`
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadToUploadcare, isUploading }
}

function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile()
  const updateProfileMutation = useUpdateProfile()
  const { uploadToUploadcare, isUploading } = useUploadAvatar()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const previewUrl = useMemo(() => {
    if (selectedFile) return URL.createObjectURL(selectedFile)
    return profile?.avatar ?? null
  }, [profile?.avatar, selectedFile])

  useEffect(() => {
    if (!selectedFile) return
    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl, selectedFile])

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty, errors },
  } = useForm<ProfileForm>({
    mode: 'onBlur',
  })

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const onSubmit = async (data: ProfileForm) => {
    let finalAvatarUrl = data.avatar

    if (selectedFile) {
      try {
        finalAvatarUrl = await uploadToUploadcare(selectedFile)
        setValue('avatar', finalAvatarUrl, { shouldDirty: true })
      } catch (_error) {
        return
      }
    }

    updateProfileMutation.mutate({ ...data, avatar: finalAvatarUrl })
  }

  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
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

  const isFormDisabled = updateProfileMutation.isPending || isUploading

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
          <div className='flex flex-col items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-card dark:bg-slate-900 p-6 text-card-foreground shadow-sm'>
            <div className='group relative mb-4'>
              <div className='h-32 w-32 overflow-hidden rounded-full border-4 border-muted'>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt='Profile'
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-muted text-muted-foreground'>
                    <User size={48} />
                  </div>
                )}
              </div>
              <label className='absolute right-1 bottom-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-background dark:border-slate-800 bg-[#b80035] text-white shadow-sm transition-transform hover:scale-105'>
                <Camera size={16} />
                <input
                  type='file'
                  className='hidden'
                  accept='image/jpeg, image/png, image/webp'
                  onChange={handleFileChange}
                  disabled={isFormDisabled}
                />
              </label>
            </div>
            <h2 className='text-lg font-semibold text-foreground dark:text-white'>
              {profile.full_name || profile.username || 'User'}
            </h2>
            <span className='mt-1 text-sm text-muted-foreground dark:text-slate-400'>Teacher</span>
          </div>
        </div>

        {/* O'ng ustun: Forma */}
        <div className='w-full md:w-2/3 lg:w-3/4'>
          <div className='rounded-xl border border-slate-200 dark:border-slate-800 bg-card dark:bg-slate-900 text-card-foreground shadow-sm'>
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
                    defaultValue={profile?.timezone || 'Asia/Karshi'}
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

              <div className='flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4'>
                <RoseButton
                  type='submit'
                  form='profile-form'
                  disabled={(!isDirty && !selectedFile) || isFormDisabled}
                  className='w-full sm:w-auto'
                >
                  {isFormDisabled ? (
                    <>
                      <Loader2 size={16} className='mr-2 animate-spin' />
                      {isUploading ? 'Uploading...' : 'Saving...'}
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
