import { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  type AdminCourseCreatePayload,
  type AdminCourseLevel,
  type AdminCourseObjective,
} from '@/api/service/admin/course.service'
import { useCreateAdminCourse } from '@/hooks/admin/courses/useCreateAdminCourse'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
      error: (err: unknown) =>
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Xato yuz berdi',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto border-t-4 border-slate-900 p-5 sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold text-slate-900'>
            Yangi kurs
          </DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='course-name' className='text-xs font-semibold'>
              Kurs nomi *
            </Label>
            <Input
              id='course-name'
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder='Masalan: IELTS Foundation'
              className='h-10 rounded-xl'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='course-desc' className='text-xs font-semibold'>
              Tavsif
            </Label>
            <Input
              id='course-desc'
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder='Qisqa izoh (ixtiyoriy)'
              className='h-10 rounded-xl'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Yo&apos;nalish</Label>
              <Select
                value={form.couser_objective}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    couser_objective: v as AdminCourseObjective,
                  }))
                }
              >
                <SelectTrigger className='h-10 rounded-xl'>
                  <SelectValue placeholder='Tanlang' />
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
              <Label className='text-xs font-semibold'>Daraja</Label>
              <Select
                value={form.level}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, level: v as AdminCourseLevel }))
                }
              >
                <SelectTrigger className='h-10 rounded-xl'>
                  <SelectValue placeholder='Tanlang' />
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
              <Label htmlFor='course-months' className='text-xs font-semibold'>
                Davomiyligi (oy)
              </Label>
              <Input
                id='course-months'
                type='number'
                min={0}
                step={1}
                value={form.duration_months}
                onChange={(e) =>
                  setForm((p) => ({ ...p, duration_months: e.target.value }))
                }
                className='h-10 rounded-xl'
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='course-price' className='text-xs font-semibold'>
                Narxi
              </Label>
              <Input
                id='course-price'
                inputMode='decimal'
                value={form.price}
                onChange={(e) =>
                  setForm((p) => ({ ...p, price: e.target.value }))
                }
                placeholder='0'
                className='h-10 rounded-xl'
              />
            </div>
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='rounded-xl'
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Bekor qilish
          </Button>
          <Button
            type='button'
            size='sm'
            className='rounded-xl bg-slate-900 font-bold hover:bg-slate-800'
            onClick={submit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <>
                <Plus className='mr-2 h-4 w-4' />
                Saqlash
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
