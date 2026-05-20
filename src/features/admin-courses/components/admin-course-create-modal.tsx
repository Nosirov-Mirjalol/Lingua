import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  type AdminCourseCreatePayload,
  type AdminCourseLevel,
  type AdminCourseObjective,
} from '@/api/service/admin/course.service'
import { useCreateAdminCourse } from '@/hooks/admin/courses/useCreateAdminCourse'
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
      error: (err: any) => err?.message || 'Xato yuz berdi',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-[32px] sm:max-w-[440px] p-8 border-none shadow-2xl'>
        <DialogHeader className="mb-6">
          <DialogTitle className='text-2xl font-bold text-foreground'>
            Yangi kurs qo'shish
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-medium">O'quv dasturi uchun asosiy parametrlarni kiriting.</p>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='space-y-2'>
            <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
              Kurs nomi
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder='IELTS Foundation'
            className='h-12 rounded-2xl bg-muted border-none px-4 text-sm font-bold'
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
              Tavsif
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder='Kurs haqida qisqacha...'
              className='rounded-2xl bg-muted border-none px-4 text-sm font-medium min-h-[100px]'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>Yo'nalish</Label>
              <Select
                value={form.couser_objective}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    couser_objective: v as AdminCourseObjective,
                  }))
                }
              >
                <SelectTrigger className='h-12 rounded-2xl bg-muted border-none px-4 font-bold text-foreground'>
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
              <Label className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>Daraja</Label>
              <Select
                value={form.level}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, level: v as AdminCourseLevel }))
                }
              >
                <SelectTrigger className='h-12 rounded-2xl bg-muted border-none px-4 font-bold text-foreground'>
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

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>
                Davomiyligi (oy)
              </Label>
              <Input
                type='number'
                value={form.duration_months}
                onChange={(e) =>
                  setForm((p) => ({ ...p, duration_months: e.target.value }))
                }
                className='h-12 rounded-2xl bg-muted border-none px-4 font-bold'
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>
                Narxi (so'm)
              </Label>
              <Input
                value={form.price}
                onChange={(e) =>
                  setForm((p) => ({ ...p, price: e.target.value }))
                }
                placeholder='0'
                className='h-12 rounded-2xl bg-muted border-none px-4 font-bold'
              />
            </div>
          </div>
        </div>

        <DialogFooter className='mt-8 gap-3 sm:gap-0'>
          <Button
            variant='ghost'
            className='flex-1 h-12 rounded-full font-bold text-muted-foreground hover:bg-muted'
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Bekor qilish
          </Button>
          <RoseButton
            onClick={submit}
            disabled={createMutation.isPending}
            className="flex-[2] h-12 rounded-full"
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
