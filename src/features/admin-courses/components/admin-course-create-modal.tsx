import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
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

const fieldClass = cn(adminInputClass, 'h-11 border-none bg-muted')

function parsePayload(form: FormState): AdminCourseCreatePayload | null {
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
  }
}

export function AdminCourseCreateModal({
  open,
  onOpenChange,
}: AdminCourseCreateModalProps) {
  const createMutation = useCreateAdminCourse()
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (open) setForm(emptyForm())
  }, [open])

  const submit = () => {
    const payload = parsePayload(form)
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
        className={cn(adminDialogClass, 'border-none p-6 shadow-2xl sm:max-w-[440px] sm:p-8')}
      >
        <DialogHeader className='mb-4'>
          <DialogTitle className='admin-text-title'>
            Yangi kurs qo&apos;shish
          </DialogTitle>
          <p className='admin-text-subtitle'>
            O&apos;quv dasturi uchun asosiy parametrlarni kiriting.
          </p>
        </DialogHeader>

        <div className='space-y-5'>
          <div className='space-y-2'>
            <Label className={adminLabelClass}>Kurs nomi</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder='IELTS Foundation'
              className={fieldClass}
            />
          </div>

          <div className='space-y-2'>
            <Label className={adminLabelClass}>Tavsif</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder='Kurs haqida qisqacha...'
              className={cn(fieldClass, 'min-h-[100px] py-2')}
            />
          </div>

          <div className='admin-dialog__form-grid grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label className={adminLabelClass}>Yo&apos;nalish</Label>
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
            <div className='space-y-2'>
              <Label className={adminLabelClass}>Daraja</Label>
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

          <div className='admin-dialog__form-grid grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label className={adminLabelClass}>Davomiyligi (oy)</Label>
              <Input
                type='number'
                value={form.duration_months}
                onChange={(e) =>
                  setForm((p) => ({ ...p, duration_months: e.target.value }))
                }
                className={fieldClass}
              />
            </div>
            <div className='space-y-2'>
              <Label className={adminLabelClass}>Narxi (so&apos;m)</Label>
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

        <DialogFooter className='mt-6 flex-col-reverse gap-3 sm:flex-row'>
          <Button
            variant='ghost'
            className='h-11 flex-1'
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Bekor qilish
          </Button>
          <RoseButton
            onClick={submit}
            disabled={createMutation.isPending}
            className='h-11 flex-[2]'
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
