import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Save } from 'lucide-react'
import { useStudentProfile } from '@/hooks/student/useStudentPortal'
import { useUpdateStudentProfile } from '@/hooks/student/useUpdateProfile'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RoseButton } from '@/components/ui/rose-button'
import { StudentPageHeader } from '@/components/student/common/student-page-header'
import { ProfileAvatar } from '@/components/shared/profile-avatar'

export function StudentProfilePage() {
  const { data: profile, isLoading } = useStudentProfile()
  const updateProfileMutation = useUpdateStudentProfile()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
        timezone: profile.timezone || '',
        bio: profile.bio || '',
        learning_goal: profile.learning_goal || '',
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData()
      
      // Barcha maydonlarni yuboramiz (Teacher panelda bo'lgani kabi)
      formData.append('username', data.username || '')
      formData.append('full_name', data.full_name || '')
      formData.append('timezone', data.timezone || '')
      formData.append('bio', data.bio || '')
      formData.append('learning_goal', data.learning_goal || '')
      
      if (selectedFile) {
        formData.append('avatar', selectedFile)
      }

      await updateProfileMutation.mutateAsync(formData)
      setSelectedFile(null)
      reset(data)
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
        description="Shaxsiy ma'lumotlaringizni va profil sozlamalarini yangilang."
      />

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[250px_minmax(0,680px)] items-start justify-start w-full h-auto'>
        {/* CHAP PANEL — Avatar */}
        <aside className='flex flex-col rounded-2xl border border-primary/40 dark:border-slate-800 bg-card p-4 text-card-foreground shadow-sm justify-center items-center shrink-0 h-auto w-full'>
          <ProfileAvatar
            avatarUrl={profile.avatar}
            name={profile.full_name || profile.username}
            role="Talaba"
            onFileSelect={setSelectedFile}
            isPending={isFormDisabled}
            size="md"
          />
        </aside>

        {/* O'NG PANEL — Form */}
        <section className='rounded-2xl border border-primary/40 dark:border-slate-800 bg-card shadow-sm flex flex-col h-auto overflow-hidden w-full'>
          <form id='profile-form' onSubmit={handleSubmit(onSubmit)} className='flex flex-col h-auto'>
            <div className='p-4 space-y-4 md:p-5 h-auto'>
              <div className='grid gap-4 sm:grid-cols-2'>

                {/* To'liq ism */}
                <div className='space-y-1.5'>
                  <label className='text-[11px] font-bold uppercase tracking-wide text-primary/70 dark:text-slate-300'>
                    To'liq ism
                  </label>
                  <Input
                    {...register('full_name')}
                    placeholder="To'liq ismingizni kiriting"
                    disabled={isFormDisabled}
                    className='h-9 rounded-xl border-primary/30 dark:border-slate-700 bg-background/50 dark:bg-slate-900/60 focus:border-primary/50 text-foreground text-xs shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500'
                  />
                  {errors.full_name && (
                    <p className='text-[10px] text-destructive mt-0.5'>
                      {String(errors.full_name.message ?? '')}
                    </p>
                  )}
                </div>

                {/* Foydalanuvchi nomi */}
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
                  {errors.username && (
                    <p className='text-[10px] text-destructive mt-0.5'>
                      {String(errors.username.message ?? '')}
                    </p>
                  )}
                </div>

                {/* Vaqt zonasi */}
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
                  {errors.timezone && (
                    <p className='text-[10px] text-destructive mt-0.5'>
                      {String(errors.timezone.message ?? '')}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className='space-y-1.5'>
                <label className='text-[11px] font-bold uppercase tracking-wide text-primary/70 dark:text-slate-300'>
                  Bio
                </label>
                <Textarea
                  {...register('bio')}
                  rows={3}
                  placeholder="O'zingiz haqida qisqacha yozing"
                  disabled={isFormDisabled}
                  className='resize-none rounded-xl border-primary/30 dark:border-slate-700 bg-background/50 dark:bg-slate-900/60 focus:border-primary/50 text-foreground text-xs p-2.5 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500'
                />
              </div>

              {/* O'quv maqsadi */}
              <div className='space-y-1.5'>
                <label className='text-[11px] font-bold uppercase tracking-wide text-primary/70 dark:text-slate-300'>
                  O'quv maqsadi
                </label>
                <Textarea
                  {...register('learning_goal')}
                  rows={3}
                  placeholder="O'qish maqsadingizni yozing"
                  disabled={isFormDisabled}
                  className='resize-none rounded-xl border-primary/30 dark:border-slate-700 bg-background/50 dark:bg-slate-900/60 focus:border-primary/50 text-foreground text-xs p-2.5 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500'
                />
              </div>
            </div>
            <div className='shrink-0 border-t border-slate-100 dark:border-slate-800/60 px-4 py-3 md:px-5 flex justify-start bg-card rounded-b-2xl'>
              <RoseButton
                type='submit'
                form='profile-form'
                roseVariant='solid'
                disabled={(!isDirty && !selectedFile) || isFormDisabled}
                className='w-full sm:w-auto min-w:135px h-9 rounded-xl text-xs font-bold transition-all active:scale-[0.97] background-image: linear-gradient(var(--tw-gradient-stops)) from-rose-500 to-pink-600 text-white shadow-md hover:from-rose-600 hover:to-pink-700 dark:from-rose-500 dark:to-rose-600 dark:hover:from-rose-400 dark:hover:to-rose-500 dark:shadow-[0_0_18px_rgba(244,63,94,0.35)] disabled:opacity-50 disabled:pointer-events-none'
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
