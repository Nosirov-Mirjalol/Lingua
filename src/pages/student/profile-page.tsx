import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Save, Camera, User as UserIcon, Settings } from 'lucide-react'
import { useStudentProfile } from '@/hooks/student/useStudentPortal'
import { useUpdateStudentProfile } from '@/hooks/student/useUpdateProfile'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RoseButton } from '@/components/ui/rose-button'
import { StudentPageHeader } from '@/components/student/common/student-page-header'

const defaultProfileImage = new URL('../assets/custom/profileImages.jpg', import.meta.url).href

export function StudentProfilePage() {
  const { data: profile, isLoading } = useStudentProfile()

  const updateProfileMutation = useUpdateStudentProfile()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const previewUrl = useMemo(() => {
    if (selectedFile) return URL.createObjectURL(selectedFile)

    const avatar = profile?.avatar
    if (avatar && avatar !== 'string' && avatar.trim()) {
      return avatar
    }

    return defaultProfileImage
  }, [profile?.avatar, selectedFile])

  const [imageSrc, setImageSrc] = useState<string>(previewUrl)

  useEffect(() => {
    setImageSrc(previewUrl)
  }, [previewUrl])

  useEffect(() => {
    if (!selectedFile) return
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl, selectedFile])

  const handleImageError = () => {
    if (imageSrc !== defaultProfileImage) {
      setImageSrc(defaultProfileImage)
    }
  }

  const {
    register,
    handleSubmit,
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData()
      if (data.username !== undefined) formData.append('username', data.username)
      if (data.full_name !== undefined) formData.append('full_name', data.full_name)
      if (data.timezone !== undefined) formData.append('timezone', data.timezone)
      if (data.bio !== undefined) formData.append('bio', data.bio)
      if (data.learning_goal !== undefined) formData.append('learning_goal', data.learning_goal)
      if (selectedFile) {
        formData.append('avatar', selectedFile)
      }

      await updateProfileMutation.mutateAsync(formData)
      setSelectedFile(null)
    } catch (error) {
      console.error('Profile update failed', error)
    }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-100 items-center justify-center'>
        <Loader2 className='animate-spin text-primary' size={40} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className='rounded-xl border border-primary/40 bg-primary/5 p-6 text-center text-primary font-medium'>
        Profil ma'lumotlarini yuklab bo'lmadi. Sahifani yangilang.
      </div>
    )
  }

  const isFormDisabled = updateProfileMutation.isPending

  return (
    <div className='mx-auto max-w-7xl space-y-8'>
      <StudentPageHeader
        title='Mening profilim'
        description='Shaxsiy ma’lumotlaringizni va profil sozlamavelarini yangilang.'
        eyebrow='Sozlamalar'
        icon={<Settings size={18} />}
      />

      <div className='grid gap-8 lg:grid-cols-[300px_1fr]'>
        <aside className='space-y-6'>
          <div className='flex flex-col items-center rounded-3xl border border-primary/70 bg-card p-8 text-card-foreground shadow-sm transition-all hover:border-primary/80'>
            <div className='group relative mb-6'>
              <div className='h-32 w-32 overflow-hidden rounded-full border-4 border-primary/10 transition-colors group-hover:border-primary/40 bg-white'>
                {imageSrc && imageSrc !== defaultProfileImage ? (
                  <img
                    src={imageSrc}
                    alt=''
                    onError={handleImageError}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-white text-muted-foreground'>
                    <UserIcon size={48} className='opacity-20' />
                  </div>
                )}
              </div>
              {updateProfileMutation.isPending && (
                <div className='absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px]'>
                  <Loader2 className='animate-spin text-white' size={24} />
                </div>
              )}
              <label className='absolute right-1 bottom-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 active:scale-95'>
                <Camera size={18} />
                <input
                  type='file'
                  style={{ display: 'none' }}
                  accept='image/jpeg, image/png, image/webp'
                  onChange={handleFileChange}
                  disabled={isFormDisabled}
                />
              </label>
            </div>

            <h2 className='text-xl font-bold text-foreground'>
              {profile.full_name || profile.username || 'User'}
            </h2>
            <span className='mt-1 text-sm font-semibold uppercase tracking-wider text-primary/60'>Talaba</span>
          </div>
        </aside>

        <section>
          <div className='rounded-3xl border border-primary/70 bg-card p-6 shadow-sm transition-all hover:border-primary/80 md:p-8'>
            <form id='profile-form' onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
              <div className='grid gap-6 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-bold uppercase tracking-wide text-primary/70'>
                    To'liq ism
                  </label>
                  <Input 
                    {...register('full_name')} 
                    placeholder='To‘liq ismingizni kiriting' 
                    disabled={isFormDisabled}
                    className='rounded-xl border-primary/40 bg-background/50 focus:border-primary/60 focus:ring-primary/10'
                  />
                  {errors.full_name && <p className='text-[0.8rem] text-destructive'>{String(errors.full_name.message ?? '')}</p>}
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-bold uppercase tracking-wide text-primary/70'>
                    Foydalanuvchi nomi
                  </label>
                  <Input 
                    {...register('username')} 
                    placeholder='Foydalanuvchi nomingizni kiriting' 
                    disabled={isFormDisabled} 
                    className='rounded-xl border-primary/40 bg-background/50 focus:border-primary/60 focus:ring-primary/10'
                  />
                  {errors.username && <p className='text-[0.8rem] text-destructive'>{String(errors.username.message ?? '')}</p>}
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-bold uppercase tracking-wide text-primary/70'>
                    Vaqt zonasi
                  </label>
                  <Input 
                    {...register('timezone')} 
                    placeholder='Mamlakat/shaҳar formatida kiriting' 
                    disabled={isFormDisabled} 
                    defaultValue={profile?.timezone || ''} 
                    className='rounded-xl border-primary/40 bg-background/50 focus:border-primary/60 focus:ring-primary/10'
                  />
                  {errors.timezone && <p className='text-[0.8rem] text-destructive'>{String(errors.timezone.message ?? '')}</p>}
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-bold uppercase tracking-wide text-primary/70'>
                  Bio
                </label>
                <Textarea
                  {...register('bio')}
                  rows={4}
                  placeholder='O‘zingiz haqida qisqacha yozing'
                  disabled={isFormDisabled}
                  className='resize-none rounded-xl border-primary/40 bg-background/50 placeholder:text-muted-foreground focus:border-primary/60 focus:ring-primary/10'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-bold uppercase tracking-wide text-primary/70'>
                  O'quv maqsadi
                </label>
                <Textarea
                  {...register('learning_goal')}
                  rows={3}
                  placeholder='O‘qish maqsadingizni yozing'
                  disabled={isFormDisabled}
                  className='resize-none rounded-xl border-primary/40 bg-background/50 placeholder:text-muted-foreground focus:border-primary/60 focus:ring-primary/10'
                />
              </div>

              <div className='flex justify-start pt-4'>
                <RoseButton
                  type='submit'
                  form='profile-form'
                  roseVariant='solid'
                  disabled={(!isDirty && !selectedFile) || isFormDisabled}
                  className='w-full sm:w-auto min-w-160px rounded-2xl bg-primary px-8 py-6 text-base font-bold text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-primary/20 focus-visible:ring-2 focus-visible:ring-primary/20 active:scale-[0.98] transition-all'
                >
                  {isFormDisabled ? (
                    <>
                      <Loader2 size={18} className='mr-2 animate-spin' />
                      {selectedFile ? 'Yuklanmoqda...' : 'Saqlanmoqda...'}
                    </>
                  ) : (
                    <>
                      <Save size={18} className='mr-2' />
                      Saqlash
                    </>
                  )}
                </RoseButton>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
