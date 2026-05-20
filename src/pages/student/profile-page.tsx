import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Save, Camera, User as UserIcon } from 'lucide-react'
import { useStudentProfile } from '@/hooks/student/useStudentPortal'
import { useUpdateStudentProfile } from '@/hooks/student/useUpdateProfile'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RoseButton } from '@/components/ui/rose-button'

export function StudentProfilePage() {
  const { data: profile, isLoading } = useStudentProfile()

  const updateProfileMutation = useUpdateStudentProfile()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const previewUrl = useMemo(() => {
    if (selectedFile) return URL.createObjectURL(selectedFile)
    return profile?.avatar ?? null
  }, [profile?.avatar, selectedFile])

  useEffect(() => {
    if (!selectedFile) return
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl, selectedFile])

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty, errors },
  } = useForm<Partial<Record<string, any>>>({
    mode: 'onBlur',
  })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        username: profile.username || '',
        avatar: profile.avatar || '',
        timezone: profile.timezone || '',
        bio: profile.bio || '',
        learning_goal: profile.learning_goal || '',
      })
    }
  }, [profile, reset])

  const uploadToUploadcare = async (file: File): Promise<string> => {
    const pubKey = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY
    if (!pubKey) throw new Error('VITE_UPLOADCARE_PUBLIC_KEY not found')

    const formData = new FormData()
    formData.append('UPLOADCARE_PUB_KEY', pubKey)
    formData.append('UPLOADCARE_STORE', 'auto')
    formData.append('file', file)

    const res = await fetch('https://upload.uploadcare.com/base/', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (!data.file) throw new Error('Uploadcare error')

    return `https://4yypsqu6p6.ucarecd.net/${data.file}/`
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const onSubmit = async (data: any) => {
    let finalAvatarUrl = data.avatar || profile?.avatar || ''

    if (selectedFile) {
      setIsUploading(true)
      try {
        finalAvatarUrl = await uploadToUploadcare(selectedFile)
        setValue('avatar', finalAvatarUrl, { shouldDirty: true })
      } catch (error) {
        setIsUploading(false)
        console.error('Avatar upload failed', error)
        // Let user know
        // eslint-disable-next-line no-undef
        ;(await import('sonner')).toast.error('Avatar upload failed')
        return
      }
      setIsUploading(false)
    }

    // Build payload only with fields that are present to avoid sending empty strings
    const payload: Record<string, unknown> = {}
    if (data.username !== undefined) payload.username = data.username
    if (data.full_name !== undefined) payload.full_name = data.full_name
    if (finalAvatarUrl) payload.avatar = finalAvatarUrl
    if (data.timezone !== undefined) payload.timezone = data.timezone
    if (data.bio !== undefined) payload.bio = data.bio
    if (data.learning_goal !== undefined) payload.learning_goal = data.learning_goal

    try {
      await updateProfileMutation.mutateAsync(payload as any)
    } catch (error) {
      console.error('Profile update failed', error)
      // eslint-disable-next-line no-undef
      ;(await import('sonner')).toast.error('Failed to update profile. See console.')
    }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-100 items-center justify-center'>
        <Loader2 className='animate-spin text-rose-500' size={40} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className='rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600'>
        Failed to load profile. Please refresh the page.
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
        <div className='w-full md:w-1/3 lg:w-1/4'>
          <div className='flex flex-col items-center rounded-xl border border-primary/10 bg-card p-6 text-card-foreground shadow-sm'>
            <div className='group relative mb-4'>
              <div className='h-32 w-32 overflow-hidden rounded-full border-4 border-primary'>
                {previewUrl ? (
                  <img src={previewUrl} alt='' className='h-full w-full object-cover' />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-muted text-muted-foreground'>
                    <UserIcon size={48} />
                  </div>
                )}
              </div>
              <label className='absolute right-1 bottom-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-[#b80035] text-white shadow-sm transition-transform hover:scale-105'>
                <Camera size={16} />
                <input
                  type='file'
                  style={{ display: 'none' }}
                  accept='image/jpeg, image/png, image/webp'
                  onChange={handleFileChange}
                  disabled={isFormDisabled}
                />
              </label>
            </div>

            <h2 className='text-lg font-semibold text-foreground dark:text-white'>
              {profile.full_name || profile.username || 'User'}
            </h2>
            <span className='mt-1 text-sm text-muted-foreground dark:text-slate-400'>Student</span>
          </div>
        </div>

        <div className='w-full md:w-2/3 lg:w-3/4'>
          <div className='rounded-xl border border-primary/10 bg-card text-card-foreground shadow-sm'>
            <form id='profile-form' onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-8'>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300'>
                    Full name
                  </label>
                  <Input {...register('full_name')} placeholder='To‘liq ismingizni kiriting' disabled={isFormDisabled} />
                  {errors.full_name && <p className='text-[0.8rem] text-destructive'>{String(errors.full_name.message ?? '')}</p>}
                </div>

                <div className='space-y-2'>
                  <label className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300'>
                    Username
                  </label>
                  <Input {...register('username')} placeholder='Foydalanuvchi nomingizni kiriting' disabled={isFormDisabled} />
                  {errors.username && <p className='text-[0.8rem] text-destructive'>{String(errors.username.message ?? '')}</p>}
                </div>

                <div className='space-y-2'>
                  <label className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300'>
                    Timezone
                  </label>
                  <Input {...register('timezone')} placeholder='Mamlakat/shaҳar formatida kiriting' disabled={isFormDisabled} defaultValue={profile?.timezone || ''} />
                  {errors.timezone && <p className='text-[0.8rem] text-destructive'>{String(errors.timezone.message ?? '')}</p>}
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300'>
                  Bio
                </label>
                <Textarea
                  {...register('bio')}
                  rows={4}
                  placeholder='O‘zingiz haqida qisqacha yozing'
                  disabled={isFormDisabled}
                  className='resize-none placeholder:text-slate-500 dark:placeholder:text-slate-400'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300'>
                  Learning Goal
                </label>
                <Textarea
                  {...register('learning_goal')}
                  rows={3}
                  placeholder='O‘qish maqsadingizni yozing'
                  disabled={isFormDisabled}
                  className='resize-none placeholder:text-slate-500 dark:placeholder:text-slate-400'
                />
              </div>

              <div className='flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4'>
                <RoseButton
                  type='submit'
                  form='profile-form'
                  roseVariant='solid'
                  disabled={(!isDirty && !selectedFile) || isFormDisabled}
                  className='w-full sm:w-auto bg-rose-600 text-white shadow-lg hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-200'
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
