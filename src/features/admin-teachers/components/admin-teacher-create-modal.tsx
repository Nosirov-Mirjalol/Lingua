import { useRef, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateAdminTeacher } from '@/hooks/admin/teachers/useCreateAdminTeacher'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoseButton } from '@/components/ui/rose-button'

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
    password: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createMutation = useCreateAdminTeacher()

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      // Auto-format phone number
      const formatted = formatPhoneNumber(value)
      setFormData((prev) => ({ ...prev, [field]: formatted }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '')

    // If starting with 998, add + prefix
    if (digits.startsWith('998')) {
      return '+' + digits
    }

    // If 9 digits (Uzbek format without country code), add +998
    if (digits.length === 9) {
      return '+998' + digits
    }

    // If empty, return empty
    if (digits.length === 0) {
      return ''
    }

    // Otherwise, just return the digits with + prefix
    return '+' + digits
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.promise(
      createMutation.mutateAsync({ ...formData, role: 'teacher' as const }),
      {
        loading: 'Yaratilmoqda...',
        success: () => {
          setFormData({
            username: '',
            email: '',
            full_name: '',
            phone: '',
            password: '',
          })
          setImageFile(null)
          setImagePreview('')
          onOpenChange(false)
          return 'Muvaffaqiyatli yaratildi'
        },
        error: 'Xato yuz berdi',
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-xl p-5 sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>Yangi Ustoz</DialogTitle>
        </DialogHeader>

        <form
          id='teacher-form'
          onSubmit={handleSubmit}
          className='grid gap-2.5 py-1'
        >
          {/* Rasm + To'liq ism + Username — bir qatorda */}
          <div className='flex items-start gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-bold text-slate-500'>Rasm</Label>
              {imagePreview ? (
                <div className='relative h-16 w-16 overflow-hidden rounded-[10px] border-2 border-border'>
                  <img
                    src={imagePreview}
                    alt='Preview'
                    className='h-full w-full object-cover'
                  />
                  <button
                    type='button'
                    onClick={handleRemoveImage}
                    className='text-destructive-foreground absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive shadow-sm hover:bg-destructive/90'
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className='flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted'
                >
                  <Upload size={18} className='text-muted-foreground' />
                  <span className='mt-1 text-[10px] text-muted-foreground'>
                    Yuklash
                  </span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleImageChange}
                className='hidden'
              />
            </div>

            <div className='flex flex-1 flex-col gap-2.5'>
              <div className='space-y-1'>
                <Label className='text-xs font-bold text-slate-500'>
                  To'liq ism
                </Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) =>
                    handleInputChange('full_name', e.target.value)
                  }
                  required
                  className='h-9 rounded-[10px]'
                />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs font-bold text-slate-500'>
                  Username
                </Label>
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange('username', e.target.value)
                  }
                  required
                  className='h-9 rounded-[10px]'
                />
              </div>
            </div>
          </div>

          {/* Email + Telefon — 2 kolonnada */}
          <div className='grid grid-cols-2 gap-2.5'>
            <div className='space-y-1'>
              <Label className='text-xs font-bold text-slate-500'>Email</Label>
              <Input
                type='email'
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className='h-9 rounded-[10px]'
              />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs font-bold text-slate-500'>
                Telefon
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className='h-9 rounded-[10px]'
              />
            </div>
          </div>

          {/* Parol */}
          <div className='space-y-1'>
            <Label className='text-xs font-bold text-slate-500'>Parol</Label>
            <Input
              type='password'
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className='h-9 rounded-[10px]'
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            variant='ghost'
            onClick={() => onOpenChange(false)}
            className='h-9 rounded-lg'
          >
            Bekor qilish
          </Button>
          <RoseButton
            type='submit'
            form='teacher-form'
            disabled={createMutation.isPending}
            className='h-9 px-8'
          >
            {createMutation.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              'Saqlash'
            )}
          </RoseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
