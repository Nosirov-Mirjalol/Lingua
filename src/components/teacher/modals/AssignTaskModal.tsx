import { useEffect } from 'react'
import { format } from 'date-fns'
import { Controller, useForm } from 'react-hook-form'
import type { Assignment } from '@/types/assignment.types'
import { X, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useTeacherGroups } from '@/hooks/teacher/groups/useTeacherGroups'
import {
  useCreateAssignment,
  useUpdateAssignment,
} from '@/hooks/useAssignments'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RoseButton } from '@/components/ui/rose-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingAssignment?: Assignment | null
}

type FormValues = {
  title: string
  group: number
  deadline_date: string
  deadline_time: string
  description: string
  max_score: number
  submission_type: 'text' | 'file'
}

const defaultValues: FormValues = {
  title: '',
  group: 0,
  deadline_date: '',
  deadline_time: '23:59',
  description: '',
  max_score: 100,
  submission_type: 'text',
}

const inputCls =
  'h-11 w-full rounded-xl border-0 bg-slate-100 px-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-rose-600/20 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className='mb-1.5 text-[11px] font-extrabold tracking-[0.14em] text-rose-700 uppercase'>
      {children}
    </p>
  )
}

export function AssignTaskModal({
  open,
  onOpenChange,
  editingAssignment,
}: Props) {
  const { data: groups, isLoading: groupsLoading } = useTeacherGroups()
  const createMutation = useCreateAssignment()
  const updateMutation = useUpdateAssignment()
  const isPending = createMutation.isPending || updateMutation.isPending

  const { register, handleSubmit, reset, control } = useForm<FormValues>({
    defaultValues,
  })

  const handleClose = () => {
    onOpenChange(false)
    reset()
  }

  useEffect(() => {
    if (!open) return
    if (editingAssignment) {
      const d = new Date(editingAssignment.deadline)
      const valid = !Number.isNaN(d.getTime())
      reset({
        title: editingAssignment.title,
        group: editingAssignment.group,
        deadline_date: valid ? format(d, 'yyyy-MM-dd') : '',
        deadline_time: valid ? format(d, 'HH:mm') : '23:59',
        description: editingAssignment.description,
        max_score: editingAssignment.max_score,
        submission_type: editingAssignment.submission_type,
      })
    } else {
      reset(defaultValues)
    }
  }, [open, editingAssignment, reset])

  const onSubmit = async (values: FormValues) => {
    const deadline = new Date(
      `${values.deadline_date}T${values.deadline_time || '23:59'}`
    )
    if (Number.isNaN(deadline.getTime()))
      return toast.error("Muddatni to'g'ri kiriting")

    const payload = {
      title: values.title,
      description: values.description,
      group: Number(values.group),
      deadline: deadline.toISOString(),
      max_score: Number(values.max_score),
      submission_type: values.submission_type,
      attachment: editingAssignment?.attachment ?? null,
    }

    try {
      if (editingAssignment) {
        await updateMutation.mutateAsync({ id: editingAssignment.id, payload })
        toast.success('Vazifa yangilandi')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Vazifa muvaffaqiyatli qo'shildi")
      }
      handleClose()
    } catch {
      toast.error(
        editingAssignment ? 'Yangilashda xatolik' : 'Yaratishda xatolik'
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] w-[95vw] max-w-180 gap-0 overflow-y-auto rounded-[28px] border-0 bg-white p-0 shadow-[0_30px_90px_-50px_rgba(2,6,23,0.45)] dark:bg-slate-900 [&>button.absolute]:hidden'>
        <DialogTitle className='sr-only'>
          {editingAssignment ? 'Vazifani tahrirlash' : "Yangi vazifa qo'shish"}
        </DialogTitle>
        <DialogDescription className='sr-only'>
          {editingAssignment
            ? 'Vazifani tahrirlash formasi'
            : 'Yangi vazifa yaratish formasi'}
        </DialogDescription>

        {/* Header */}
        <div className='flex items-start justify-between px-6 pt-5 md:px-8 md:pt-6'>
          <div>
            <h2 className='text-xl font-extrabold text-slate-900 dark:text-slate-100'>
              {editingAssignment
                ? 'Vazifani tahrirlash'
                : "Yangi vazifa qo'shish"}
            </h2>
            <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
              {editingAssignment
                ? "Avvalgi ma'lumotlar asosida yangilang"
                : "O'quvchilar uchun yangi topshiriq yarating"}
            </p>
          </div>
          <button
            type='button'
            onClick={handleClose}
            className='grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col gap-5 px-6 pt-5 pb-4 md:px-8 md:pt-6 md:pb-6'
        >
          <div>
            <Label>VAZIFA NOMI</Label>
            <input
              type='text'
              placeholder='Masalan: Unit 5 Vocabulary Practice'
              {...register('title', { required: true })}
              className={inputCls}
            />
          </div>

          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <div>
              <Label>GURUHNI TANLANG</Label>
              <Controller
                control={control}
                name='group'
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className='h-11 w-full rounded-xl border-0 bg-slate-100 px-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-rose-600/20 dark:bg-slate-800 dark:text-slate-100'>
                      <SelectValue
                        placeholder={
                          groupsLoading ? 'Yuklanmoqda...' : 'Guruhni tanlang'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(groups ?? []).map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label>MUDDAT</Label>
              <div className='flex items-center gap-3'>
                <Controller
                  control={control}
                  name='deadline_date'
                  rules={{ required: true }}
                  render={({ field }) => {
                    const date = field.value ? new Date(field.value) : undefined
                    const valid = date && !Number.isNaN(date.getTime())
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type='button'
                            className='h-11 flex-1 rounded-xl border-0 bg-slate-100 px-4 text-left text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-rose-600/20 dark:bg-slate-800 dark:text-slate-100'
                          >
                            {valid ? (
                              format(date!, 'dd.MM.yyyy')
                            ) : (
                              <span className='text-slate-400 dark:text-slate-500'>
                                Calendar
                              </span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={date}
                            onSelect={(d) =>
                              d && field.onChange(format(d, 'yyyy-MM-dd'))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )
                  }}
                />
                <input
                  type='time'
                  {...register('deadline_time', { required: true })}
                  className='h-11 w-28 shrink-0 rounded-xl border-0 bg-slate-100 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-rose-600/20 dark:bg-slate-800 dark:text-slate-100 [&::-webkit-calendar-picker-indicator]:hidden'
                />
              </div>
            </div>
          </div>

          <div>
            <Label>TAVSIF</Label>
            <textarea
              placeholder="Vazifa bo'yicha ko'rsatmalarni shu yerda yozing..."
              rows={3}
              {...register('description', { required: true })}
              className='min-h-22 w-full resize-none rounded-xl border-0 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-rose-600/20 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500'
            />
          </div>

          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <div>
              <Label>MAKSIMAL BALL</Label>
              <input
                type='number'
                {...register('max_score', {
                  required: true,
                  valueAsNumber: true,
                })}
                className={inputCls}
              />
            </div>
            <div>
              <Label>TOPSHIRISH TURI</Label>
              <Controller
                control={control}
                name='submission_type'
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as 'text' | 'file')}
                  >
                    <SelectTrigger className='h-11 w-full rounded-xl border-0 bg-slate-100 px-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-rose-600/20 dark:bg-slate-800 dark:text-slate-100'>
                      <SelectValue placeholder='Topshirish turini tanlang' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='text'>Matn</SelectItem>
                      <SelectItem value='file'>Fayl</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className='flex flex-col-reverse items-stretch justify-end gap-3 px-6 pb-5 sm:flex-row sm:items-center md:px-8 md:pb-6'>
          <RoseButton
            type='button'
            roseVariant='outline'
            roseSize='md'
            onClick={handleClose}
            className='h-11 rounded-2xl px-6'
          >
            Bekor qilish
          </RoseButton>
          <RoseButton
            type='button'
            roseVariant='gradient'
            roseSize='md'
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className='h-11 rounded-2xl px-7'
          >
            <Send size={16} />
            {isPending
              ? 'Yuborilmoqda...'
              : editingAssignment
                ? 'Vazifani saqlash'
                : 'Vazifani yuborish'}
          </RoseButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
