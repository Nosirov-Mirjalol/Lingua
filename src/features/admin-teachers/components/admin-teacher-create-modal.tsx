import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RoseButton } from '@/components/ui/rose-button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateAdminTeacher } from '@/hooks/admin/teachers/useCreateAdminTeacher'
import { Loader2 } from 'lucide-react'

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
    full_name: '',
    phone: '',
    learning_goal: '',
    password: '',
  })

  const createMutation = useCreateAdminTeacher()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.promise(createMutation.mutateAsync({ ...formData, role: 'teacher' }), {
      loading: 'Yaratilmoqda...',
      success: () => {
        setFormData({
          username: '',
          email: '',
          full_name: '',
          phone: '',
          learning_goal: '',
          password: '',
        })
        onOpenChange(false)
        return 'Muvaffaqiyatli yaratildi'
      },
      error: 'Xato yuz berdi',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md rounded-xl p-6'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>Yangi Ustoz</DialogTitle>
        </DialogHeader>
        <form id='teacher-form' onSubmit={handleSubmit} className='grid gap-4 py-2'>
          <div className='space-y-1'>
            <Label className='text-xs font-bold text-slate-500'>To'liq ism</Label>
            <Input
              value={formData.full_name}
              onChange={e => handleInputChange('full_name', e.target.value)}
              required
              className='h-10 rounded-lg'
            />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs font-bold text-slate-500'>Username</Label>
            <Input value={formData.username} onChange={e => handleInputChange('username', e.target.value)} required className="h-10 rounded-lg" />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs font-bold text-slate-500'>Email</Label>
            <Input type='email' value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required className="h-10 rounded-lg" />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs font-bold text-slate-500'>Telefon</Label>
            <Input value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="h-10 rounded-lg" />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs font-bold text-slate-500'>O'quv maqsadi</Label>
            <Input value={formData.learning_goal} onChange={e => handleInputChange('learning_goal', e.target.value)} className="h-10 rounded-lg" />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs font-bold text-slate-500'>Parol</Label>
            <Input type='password' value={formData.password} onChange={e => handleInputChange('password', e.target.value)} required className="h-10 rounded-lg" />
          </div>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg h-10">Bekor qilish</Button>
          <RoseButton type='submit' form='teacher-form' disabled={createMutation.isPending} className="px-8">
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Saqlash'}
          </RoseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
