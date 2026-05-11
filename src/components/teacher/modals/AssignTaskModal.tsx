import { useEffect } from 'react'
import { format } from 'date-fns'
import { Controller, useForm } from 'react-hook-form'
import { X, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useTeacherGroups } from '@/hooks/teacher/groups/useTeacherGroups'
import { useCreateAssignment, useUpdateAssignment } from '@/hooks/useAssignments'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Assignment } from '@/types/assignment.types'

type AssignTaskModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingAssignment?: Assignment | null
}

type AssignTaskForm = {
  title: string
  group: number
  deadline_date: string
  deadline_time: string
  description: string
  max_score: number
  submission_type: 'text' | 'file'
}

function FieldLabel({ children }: { children: React.ReactNode }) {
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
}: AssignTaskModalProps) {
  const { data: groups, isLoading: groupsLoading } = useTeacherGroups()
  const createMutation = useCreateAssignment()
  const updateMutation = useUpdateAssignment()
  const { register, handleSubmit, reset, control } = useForm<AssignTaskForm>({
    defaultValues: {
      title: '',
      group: 0,
      deadline_date: '',
      deadline_time: '23:59',
      description: '',
      max_score: 100,
      submission_type: 'text',
    },
  })

  const handleClose = () => {
    onOpenChange(false)
    reset()
  }

  useEffect(() => {
    if (!open) return
    if (editingAssignment) {
      const deadlineDate = new Date(editingAssignment.deadline)
      reset({
        title: editingAssignment.title,
        group: editingAssignment.group,
        deadline_date: Number.isNaN(deadlineDate.getTime())
          ? ''
          : format(deadlineDate, 'yyyy-MM-dd'),
        deadline_time: Number.isNaN(deadlineDate.getTime())
          ? '23:59'
          : format(deadlineDate, 'HH:mm'),
        description: editingAssignment.description,
        max_score: editingAssignment.max_score,
        submission_type: editingAssignment.submission_type,
      })
      return
    }

    reset({
      title: '',
      group: 0,
      deadline_date: '',
      deadline_time: '23:59',
      description: '',
      max_score: 100,
      submission_type: 'text',
    })
  }, [open, editingAssignment, reset])

  const onSubmit = async (values: AssignTaskForm) => {
    try {
      const deadlineDateTime = new Date(
        `${values.deadline_date}T${values.deadline_time || '23:59'}`
      )

      if (Number.isNaN(deadlineDateTime.getTime())) {
        toast.error("Muddatni to'g'ri kiriting")
        return
      }

      const payload = {
        title: values.title,
        description: values.description,
        group: Number(values.group),
        deadline: deadlineDateTime.toISOString(),
        max_score: Number(values.max_score),
        submission_type: values.submission_type,
        attachment: editingAssignment?.attachment ?? null,
      }

      if (editingAssignment) {
        await updateMutation.mutateAsync({
          id: editingAssignment.id,
          payload,
        })
        toast.success('Vazifa yangilandi')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Vazifa muvaffaqiyatli qo'shildi")
      }
      handleClose()
    } catch {
      toast.error(
        editingAssignment
          ? 'Vazifani yangilashda xatolik yuz berdi'
          : 'Vazifani yaratishda xatolik yuz berdi'
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] w-[95vw] max-w-[720px] gap-0 overflow-y-auto rounded-[28px] border-0 bg-white p-0 shadow-[0_30px_90px_-50px_rgba(2,6,23,0.45)] [&>button.absolute]:hidden'>
        <div className='flex items-start justify-between px-6 pt-5 md:px-8 md:pt-6'>
          <div>
            <h2 className='text-xl font-extrabold text-slate-900'>
              {editingAssignment ? 'Vazifani tahrirlash' : "Yangi vazifa qo'shish"}
            </h2>
            <p className='mt-1 text-sm text-slate-500'>
              {editingAssignment
                ? "Avvalgi ma'lumotlar asosida topshiriqni yangilang"
                : "O'quvchilar uchun yangi topshiriq yarating"}
            </p>
          </div>
          <button
            type='button'
            onClick={handleClose}
            className='grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200'
          >
            <X size={18} />
          </button>
        </div>

        <form
          id='assign-task-form'
          onSubmit={handleSubmit(onSubmit)}
          className='px-6 pt-5 pb-4 md:px-8 md:pt-6 md:pb-6'
        >
          <div className='flex flex-col gap-5'>
            {/* VAZIFA NOMI */}
            <div className='flex flex-col'>
              <FieldLabel>VAZIFA NOMI</FieldLabel>
              <input
                type='text'
                placeholder='Masalan: Unit 5 Vocabulary Practice'
                {...register('title', { required: true })}
                className='h-11 w-full rounded-xl border-0 bg-slate-100 px-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-rose-600/20'
              />
            </div>

            {/* GURUH VA MUDDAT */}
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
              <div className='flex flex-col'>
                <FieldLabel>GURUHNI TANLANG</FieldLabel>
                <Controller
                  control={control}
                  name='group'
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger className='h-11 w-full rounded-xl border-0 bg-slate-100 px-4 py-5.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-rose-600/20'>
                        <SelectValue
                          placeholder={
                            groupsLoading
                              ? 'Guruhlar yuklanmoqda...'
                              : 'Guruhni tanlang'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(groups ?? []).map((group) => (
                          <SelectItem key={group.id} value={String(group.id)}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className='flex flex-col'>
                <FieldLabel>MUDDAT</FieldLabel>
                <div className='flex w-full items-center gap-3'>
                  <Controller
                    control={control}
                    name='deadline_date'
                    rules={{ required: true }}
                    render={({ field }) => {
                      const selectedDate = field.value
                        ? new Date(field.value)
                        : undefined
                      return (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type='button'
                              className='h-11 flex-1 rounded-xl border-0 bg-slate-100 px-4 text-left text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-rose-600/20'
                            >
                              {selectedDate &&
                              !Number.isNaN(selectedDate.getTime()) ? (
                                format(selectedDate, 'dd.MM.yyyy')
                              ) : (
                                <span className='text-slate-400'>Calendar</span>
                              )}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={selectedDate}
                              onSelect={(date) => {
                                if (!date) return
                                field.onChange(format(date, 'yyyy-MM-dd'))
                              }}
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
                    className='h-11 w-28 shrink-0 rounded-xl border-0 bg-slate-100 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-rose-600/20 [&::-webkit-calendar-picker-indicator]:hidden'
                  />
                </div>
              </div>
            </div>

            {/* TAVSIF */}
            <div className='flex flex-col'>
              <FieldLabel>TAVSIF</FieldLabel>
              <textarea
                placeholder="Vazifa bo'yicha ko'rsatmalarni shu yerda yozing..."
                rows={3}
                {...register('description', { required: true })}
                className='min-h-[88px] w-full resize-none rounded-xl border-0 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-rose-600/20'
              />
            </div>

            {/* BALL VA TURI */}
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
              <div className='flex flex-col'>
                <FieldLabel>MAKSIMAL BALL</FieldLabel>
                <input
                  type='number'
                  {...register('max_score', {
                    required: true,
                    valueAsNumber: true,
                  })}
                  className='h-11 w-full rounded-xl border-0 bg-slate-100 px-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-rose-600/20'
                />
              </div>
              <div className='flex flex-col'>
                <FieldLabel>TOPSHIRISH TURI</FieldLabel>
                <Controller
                  control={control}
                  name='submission_type'
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as 'text' | 'file')
                      }
                    >
                      <SelectTrigger className='h-11 w-full rounded-xl border-0 bg-slate-100 px-4 py-5.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-rose-600/20'>
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
          </div>
        </form>

        {/* BUTTONLAR */}
        <div className='flex flex-col-reverse items-stretch justify-end gap-3 px-6 pb-5 sm:flex-row sm:items-center md:px-8 md:pb-6'>
          <button
            type='button'
            onClick={handleClose}
            className='h-11 rounded-full bg-slate-100 px-6 text-sm font-bold text-slate-600 hover:bg-slate-200'
          >
            Bekor qilish
          </button>
          <button
            type='button'
            onClick={handleSubmit(onSubmit)}
            disabled={createMutation.isPending || updateMutation.isPending}
            className='primary-gradient inline-flex h-11 items-center gap-2 rounded-full px-7 text-sm font-bold text-white shadow-lg shadow-rose-900/15'
          >
            <Send size={16} />
            {createMutation.isPending || updateMutation.isPending
              ? 'Yuborilmoqda...'
              : editingAssignment
                ? 'Vazifani saqlash'
                : 'Vazifani yuborish'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
