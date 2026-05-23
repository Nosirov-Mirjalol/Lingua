import { useEffect, useRef, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  type AdminCourseCreatePayload,
  type AdminCourseLevel,
  type AdminCourseObjective,
} from '@/api/service/admin/course.service'
import { useCreateAdminCourse } from '@/hooks/admin/courses/useCreateAdminCourse'
import { cn } from '@/lib/utils'
import {
  adminDialogClass,
  adminInputClass,
  adminLabelClass,
} from '@/lib/admin-ui'
import { Button } from '@/components/ui/button'
import { RoseButton } from '@/components/ui/rose-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const OBJECTIVES: { value: AdminCourseObjective; label: string }[] = [
  { value: 'general', label: 'General English' },
  { value: 'ielts', label: 'IELTS' },
  { value: 'toefl', label: 'TOEFL' },
  { value: 'kids', label: 'Bolalar' },
  { value: 'business', label: 'Business' },
]

const LEVELS: { value: AdminCourseLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export type AdminCourseCreateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormState = {
  name: string
  description: string
  couser_objective: AdminCourseObjective
  level: AdminCourseLevel
  duration_months: string
  price: string
}

const emptyForm = (): FormState => ({
  name: '',
  description: '',
  couser_objective: 'general',
  level: 'beginner',
  duration_months: '1',
  price: '0',
})

const fieldClass = cn(
  adminInputClass,
  'h-10 border-none bg-muted px-3 text-sm focus-visible:ring-1 focus-visible:ring-primary'
)
const labelClass = cn(adminLabelClass, 'text-xs')
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function parsePayload(
  form: FormState,
  imageFile: File | null
): AdminCourseCreatePayload | null {
  const name = form.name.trim()
  if (!name) return null

  const months = Number(form.duration_months)
  if (!Number.isFinite(months) || months < 0 || !Number.isInteger(months)) {
    toast.error("Davomiylik (oy) musbat butun son bo'lishi kerak")
    return null
  }

  const price = form.price.trim() || '0'

  return {
    name,
    description: form.description.trim() || undefined,
    couser_objective: form.couser_objective,
    level: form.level,
    duration_months: months,
    price,
    image: imageFile ?? undefined,
  }
}

export function AdminCourseCreateModal({
  open,
  onOpenChange,
}: AdminCourseCreateModalProps) {
  const createMutation = useCreateAdminCourse()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetImage = () => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    if (open) {
      setForm(emptyForm())
      resetImage()
    }
  }, [open])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Faqat rasm faylini yuklang')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Rasm hajmi 5 MB dan oshmasin')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () =>
      setImagePreview(typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
  }

  const submit = () => {
    const payload = parsePayload(form, imageFile)
    if (!payload) {
      toast.error('Kurs nomi kiritilmadi')
      return
    }

    toast.promise(createMutation.mutateAsync(payload), {
      loading: 'Yaratilmoqda...',
      success: () => {
        onOpenChange(false)
        return 'Kurs yaratildi'
      },
      error: (err: { message?: string }) => err?.message || 'Xato yuz berdi',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          adminDialogClass,
          'flex max-h-[min(90vh,680px)] flex-col gap-0 overflow-hidden border-none p-0 shadow-2xl sm:max-w-[400px]'
        )}
      >
        <DialogHeader className='shrink-0 border-b px-4 py-3'>
          <DialogTitle className='text-base font-bold'>
            Yangi kurs qo&apos;shish
          </DialogTitle>
          <DialogDescription className='sr-only'>
            Yangi o&apos;quv kursi yaratish formasi
          </DialogDescription>
        </DialogHeader>

        <div className='min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3'>
          <div className='space-y-1.5'>
            <Label className={labelClass}>Rasm</Label>
            {imagePreview ? (
              <div className='relative h-28 w-full overflow-hidden rounded-lg border bg-muted'>
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='block h-full w-full cursor-pointer'
                  aria-label='Rasmni almashtirish'
                >
                  <img
                    src={imagePreview}
                    alt='Kurs rasmi'
                    className='h-full w-full object-cover'
                  />
                  <span className='absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] font-medium text-white'>
                    Almashtirish
                  </span>
                </button>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    resetImage()
                  }}
                  className='absolute top-1.5 right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90'
                  aria-label='Rasmni olib tashlash'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              </div>
            ) : (
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-primary hover:bg-muted/70'
              >
                <Upload className='mb-1 h-6 w-6 text-muted-foreground' />
                <span className='text-xs font-medium text-muted-foreground'>
                  Rasm yuklash
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              className='hidden'
            />
          </div>

          <div className='space-y-1.5'>
            <Label className={labelClass}>Kurs nomi</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder='IELTS Foundation'
              className={fieldClass}
            />
          </div>

          <div className='space-y-1.5'>
            <Label className={labelClass}>Tavsif</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder='Qisqacha...'
              rows={2}
              className={cn(fieldClass, 'min-h-[4.5rem] resize-none py-2')}
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className={labelClass}>Yo&apos;nalish</Label>
              <Select
                value={form.couser_objective}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    couser_objective: v as AdminCourseObjective,
                  }))
                }
              >
                <SelectTrigger className={fieldClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBJECTIVES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label className={labelClass}>Daraja</Label>
              <Select
                value={form.level}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, level: v as AdminCourseLevel }))
                }
              >
                <SelectTrigger className={fieldClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className={labelClass}>Davomiylik (oy)</Label>
              <Input
                type='number'
                value={form.duration_months}
                onChange={(e) =>
                  setForm((p) => ({ ...p, duration_months: e.target.value }))
                }
                className={fieldClass}
              />
            </div>
            <div className='space-y-1.5'>
              <Label className={labelClass}>Narx</Label>
              <Input
                value={form.price}
                onChange={(e) =>
                  setForm((p) => ({ ...p, price: e.target.value }))
                }
                placeholder='0'
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <DialogFooter className='shrink-0 gap-2 border-t px-4 py-3'>
          <Button
            type='button'
            variant='ghost'
            className='h-10 flex-1'
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Bekor
          </Button>
          <RoseButton
            type='button'
            onClick={submit}
            disabled={createMutation.isPending}
            className='h-10 flex-1'
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
