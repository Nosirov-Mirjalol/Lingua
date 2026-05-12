import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateAdminTeacher } from '@/hooks/admin/teachers/useCreateAdminTeacher'

export function AdminTeacherCreateModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
  })

  const createMutation = useCreateAdminTeacher()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone.trim() || undefined,
      password: formData.password.trim(),
      role: 'teacher' as const,
    }

    toast.promise(createMutation.mutateAsync(payload), {
      loading: 'Yaratilmoqda...',
      success: () => {
        setFormData({
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          phone: '',
          password: '',
        })
        onOpenChange(false)
        return 'Teacher yaratildi'
      },
      error: 'Xato yuz berdi',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='border-t-4 border-slate-900 sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold text-slate-900'>
            Yangi teacher
          </DialogTitle>
        </DialogHeader>
        <form
          id='admin-teacher-create-form'
          onSubmit={handleSubmit}
          className='space-y-4 py-2'
        >
          <div className='space-y-2'>
            <Label htmlFor='username' className='text-xs font-semibold'>
              Username
            </Label>
            <Input
              id='username'
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder='Username'
              className='h-10 rounded-xl'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email' className='text-xs font-semibold'>
              Email
            </Label>
            <Input
              id='email'
              type='email'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder='Email'
              className='h-10 rounded-xl'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='first_name' className='text-xs font-semibold'>
              Ism
            </Label>
            <Input
              id='first_name'
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder='Ismi'
              className='h-10 rounded-xl'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='last_name' className='text-xs font-semibold'>
              Familiya
            </Label>
            <Input
              id='last_name'
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder='Familiyasi'
              className='h-10 rounded-xl'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='phone' className='text-xs font-semibold'>
              Telefon
            </Label>
            <Input
              id='phone'
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder='+998 XX XXX XX XX'
              className='h-10 rounded-xl'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password' className='text-xs font-semibold'>
              Parol
            </Label>
            <Input
              id='password'
              type='password'
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder='Parol'
              className='h-10 rounded-xl'
              required
            />
          </div>
        </form>
        <div className='flex justify-end space-x-2 border-t pt-4'>
          <Button
            variant='outline'
            type='button'
            onClick={() => onOpenChange(false)}
            className='rounded-xl'
            disabled={createMutation.isPending}
          >
            Bekor qilish
          </Button>
          <Button
            type='submit'
            form='admin-teacher-create-form'
            className='rounded-xl bg-slate-900 font-bold hover:bg-slate-800'
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Yaratilmoqda...' : 'Yaratish'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
