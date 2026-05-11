import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useStudentProfile } from '@/hooks/student/useStudentPortal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/student/profile')({
  component: StudentProfilePage,
})

type ProfileForm = {
  full_name: string
  email: string
  phone: string
  goal: string
  bio: string
}

function StudentProfilePage() {
  const { data: profile } = useStudentProfile()
  const { register, reset, handleSubmit, formState } = useForm<ProfileForm>({
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      goal: '',
      bio: '',
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        goal: profile.goal,
        bio: profile.goal,
      })
    }
  }, [profile, reset])

  const onSubmit = (data: ProfileForm) => {
    console.log('Update profile', data)
  }

  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      <div className='space-y-2'>
        <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>Profile</p>
        <h1 className='text-3xl font-semibold text-slate-900'>Manage your student profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='full_name'>Full name</Label>
                <Input id='full_name' {...register('full_name')} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email address</Label>
                <Input id='email' type='email' {...register('email')} />
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone number</Label>
                <Input id='phone' {...register('phone')} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='goal'>Learning goal</Label>
                <Input id='goal' {...register('goal')} />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='bio'>Bio</Label>
              <Textarea id='bio' rows={4} {...register('bio')} />
            </div>

            <div className='flex justify-end'>
              <Button type='submit' disabled={!formState.isDirty}>
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
