import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useStudentProfile } from '@/hooks/student/useStudentPortal'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StudentPageHeader } from '@/components/student/common/student-page-header'

type ProfileForm = {
  username: string
  full_name: string
  avatar: string
  timezone: string
  bio: string
  learning_goal: string
}

export function StudentProfilePage() {
  const { data: profile } = useStudentProfile()
  const { register, reset, handleSubmit, formState } = useForm<ProfileForm>({
    defaultValues: {
      username: '',
      full_name: '',
      avatar: '',
      timezone: '',
      bio: '',
      learning_goal: '',
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!profile) return

    reset({
      username: profile.username || '',
      full_name: profile.full_name || '',
      avatar: profile.avatar || '',
      timezone: profile.timezone || '',
      bio: profile.bio || '',
      learning_goal: profile.learning_goal || '',
    })
  }, [profile, reset])

  const onSubmit = (data: ProfileForm) => {
    console.log('Update profile', data)
  }

  return (
    <div className='max-w-4xl space-y-6'>
      <StudentPageHeader title='Manage your student profile' eyebrow='Profile' />

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='username'>Username</Label>
                <Input id='username' placeholder='Enter username' {...register('username')} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='full_name'>Full name</Label>
                <Input
                  id='full_name'
                  placeholder='Enter full name'
                  {...register('full_name')}
                />
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='avatar'>Avatar URL</Label>
                <Input
                  id='avatar'
                  placeholder='https://example.com/avatar.jpg'
                  {...register('avatar')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='timezone'>Timezone</Label>
                <Input id='timezone' placeholder='UTC+5' {...register('timezone')} />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='learning_goal'>Learning goal</Label>
              <Input
                id='learning_goal'
                placeholder='e.g. Learn English for work'
                {...register('learning_goal')}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='bio'>Bio</Label>
              <Textarea
                id='bio'
                rows={4}
                placeholder='Tell us about yourself'
                {...register('bio')}
              />
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
