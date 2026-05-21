import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Save, Camera, User as UserIcon } from 'lucide-react'
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
        bio: '',
        learning_goal: '',
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
    <div className='mx-auto max-w-5xl space-y-4 select-none pb-8 px-4 sm:px-0'>
      <StudentPageHeader
        title='Mening profilim'
        description='Shaxsiy ma’lumotlaringizni va profil sozlamalarini yangilang.'
      />

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[250px_minmax(0,680px)] items-start justify-start w-full h-auto'>
        
        {/* CHAP PANEL */}
        <aside className='flex flex-col !rounded-[16px] border border-primary/40 dark:border-slate-800 bg-card p-4 text-card-foreground shadow-sm justify-center items-center shrink-0 h-auto w-full'>
          <div className='group relative mb-3 shrink-0'>
            <div className='h-24 w-24 overflow-hidden rounded-full border-4 border-primary/10 dark:border-slate-800 transition-colors group-hover:border-primary/40 bg-white dark:bg-slate-900'>
              {imageSrc && imageSrc !== defaultProfileImage ? (
                <img
                  src={imageSrc}
                  alt=''
                  onError={handleImageError}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-white dark:bg-slate-900 text-muted-foreground'>
                  <UserIcon size={38} className='opacity-20' />
                </div>
              )}
            </div>
            {updateProfileMutation.isPending && (
              <div className='absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px]'>
                <Loader2 className='animate-spin text-white' size={20} />
              </div>
            )}
            <label className='absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 active:scale-95'>
              <Camera size={14} />
              <input
                type='file'
                style={{ display: 'none' }}
                accept='image/jpeg, image/png, image/webp'
                onChange={handleFileChange}
                disabled={isFormDisabled}
              />
            </label>
          </div>

          <h2 className='text-sm font-bold text-foreground text-center truncate w-full px-2'>
            {profile.full_name || profile.username || 'User'}
          </h2>
          <span className='mt-0.5 text-[10px] font-bold uppercase tracking-wider text-primary/60 dark:text-slate-400 shrink-0'>
            Talaba
          </span>
        </aside>

        {/* O'NG PANEL */}
        <section className='!rounded-[16px] border border-primary/40 dark:border-slate-800 bg-card shadow-sm flex flex-col h-auto overflow-hidden w-full'>
          <form id='profile-form' onSubmit={handleSubmit(onSubmit)} className='flex flex-col h-auto'>
            
            <div className='p-4 space-y-4 md:p-5 h-auto'>
              <div className='grid gap-4 sm:grid-cols-2'>
                
                <div className='space-y-1.5'>
                  <label className='text-[11px] font-bold uppercase tracking-wide text-primary/70 dark:text-slate-300'>
                    To'liq ism
                  </label>
                  <Input 
                    {...register('full_name')} 
                    placeholder='To‘liq ismingizni kiriting' 
                    disabled={isFormDisabled}
                    className='h-9 rounded-xl border-primary/30 dark:border-slate-700 bg-background/50 dark:bg-slate-900/60 focus:border-primary/50 text-foreground text-xs shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500'
                  />
                  {errors.full_name && <p className='text-[10px] text-destructive mt-0.5'>{String(errors.full_name.message ?? '')}</p>}
                </div>

                <div className='space-y-1.5'>
                  <label className='text-[11px] font-bold uppercase tracking-wide text-primary/70 dark:text-slate-300'>
                    Foydalanuvchi nomi
                  </label>
                  <Input 
                    {...register('username')} 
                    placeholder='Foydalanuvchi nomingizni kiriting' 
                    disabled={isFormDisabled} 
                    className='h-9 rounded-xl border-primary/30 dark:border-slate-700 bg-background/50 dark:bg-slate-900/60 focus:border-primary/50 text-foreground text-xs shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500'
                  />
                  {errors.username && <p className='text-[10px] text-destructive mt-0.5'>{String(errors.username.message ?? '')}</p>}
                </div>

                <div className='space-y-1.5 sm:col-span-2'>
                  <label className='text-[11px] font-bold uppercase tracking-wide text-primary/70 dark:text-slate-300'>
                    Vaqt zonasi
                  </label>
                  <Input 
                    {...register('timezone')} 
                    placeholder='Mamlakat/shahar formatida kiriting' 
                    disabled={isFormDisabled} 
                    className='h-9 rounded-xl border-primary/30 dark:border-slate-700 bg-background/50 dark:bg-slate-900/60 focus:border-primary/50 text-foreground text-xs shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500'
                  />
                  {errors.timezone && <p className='text-[10px] text-destructive mt-0.5'>{String(errors.timezone.message ?? '')}</p>}
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-[11px] font-bold uppercase tracking-wide text-primary/70 dark:text-slate-300'>
                  Bio
                </label>
                <Textarea
                  {...register('bio')}
                  rows={3}
                  placeholder='O‘zingiz haqida qisqacha yozing'
                  disabled={isFormDisabled}
                  className='resize-none rounded-xl border-primary/30 dark:border-slate-700 bg-background/50 dark:bg-slate-900/60 focus:border-primary/50 text-foreground text-xs p-2.5 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-[11px] font-bold uppercase tracking-wide text-primary/70 dark:text-slate-300'>
                  O'quv maqsadi
                </label>
                <Textarea
                  {...register('learning_goal')}
                  rows={2.5}
                  placeholder='O‘qish maqsadingizni yozing'
                  disabled={isFormDisabled}
                  className='resize-none rounded-xl border-primary/30 dark:border-slate-700 bg-background/50 dark:bg-slate-900/60 focus:border-primary/50 text-foreground text-xs p-2.5 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500'
                />
              </div>
            </div>
            <div className='shrink-0 border-t border-slate-100 dark:border-slate-800/60 px-4 py-3 md:px-5 flex justify-start bg-card !rounded-b-[16px]'>
              <RoseButton
                type='submit'
                form='profile-form'
                roseVariant='solid'
                disabled={(!isDirty && !selectedFile) || isFormDisabled}
                className='w-full sm:w-auto min-w-[135px] h-9 rounded-xl text-xs font-bold transition-all active:scale-[0.97] bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md hover:from-rose-600 hover:to-pink-700 dark:from-rose-500 dark:to-rose-600 dark:hover:from-rose-400 dark:hover:to-rose-500 dark:shadow-[0_0_18px_rgba(244,63,94,0.35)] disabled:opacity-50 disabled:pointer-events-none'
              >
                {isFormDisabled ? (
                  <>
                    <Loader2 size={13} className='mr-1.5 animate-spin' />
                    {selectedFile ? 'Yuklanmoqda...' : 'Saqlanmoqda...'}
                  </>
                ) : (
                  <>
                    <Save size={13} className='mr-1.5' />
                    Saqlash
                  </>
                )}
              </RoseButton>
            </div>

          </form>
        </section>

      </div>
    </div>
  )
}