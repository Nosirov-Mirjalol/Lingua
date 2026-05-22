import { useEffect } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { useCreateAdminGroup } from '@/hooks/admin/groups/useCreateAdminGroup'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'
import { cn } from '@/lib/utils'
import {
  adminDialogClass,
  adminInputClass,
  adminLabelClass,
} from '@/lib/admin-ui'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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

const formSchema = z.object({
  name: z.string().min(1, 'Nom kiritilishi shart'),
  course: z.string().min(1, 'Kursni tanlang'),
  teacher: z.string().min(1, 'Ustozni tanlang'),
  start_date: z.string().min(1, 'Sanani tanlang'),
  time_from: z.string().min(1, 'Vaqtni tanlang'),
  time_to: z.string().min(1, 'Vaqtni tanlang'),
  week_days_type: z.enum(['toq_kunlar', 'juft_kunlar', 'har_kuni']),
})

type FormValues = z.infer<typeof formSchema>

const inputClasses = cn(
  adminInputClass,
  'h-10 border-none bg-muted px-3 text-sm focus-visible:ring-1 focus-visible:ring-primary'
)
const labelClasses = cn(adminLabelClass, 'text-xs')

type TeacherRow = {
  id: number
  username: string
  first_name?: string
  last_name?: string
}

type AdminGroupCreateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminGroupCreateModal({
  open,
  onOpenChange,
}: AdminGroupCreateModalProps) {
  const { data: courses = [] } = useAdminCourses('')
  const { data: rawTeachersData } = useAdminTeachers()
  const createMutation = useCreateAdminGroup()

  const teachers: TeacherRow[] = (() => {
    const data: unknown = rawTeachersData
    const list = Array.isArray(data)
      ? data
      : data &&
          typeof data === 'object' &&
          Array.isArray((data as { results?: unknown }).results)
        ? (data as { results: unknown[] }).results
        : []
    return (list as TeacherRow[]).filter((t) => t.id != null)
  })()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      course: '',
      teacher: '',
      start_date: new Date().toISOString().split('T')[0],
      time_from: '09:00',
      time_to: '10:30',
      week_days_type: 'toq_kunlar',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: '',
        course: '',
        teacher: '',
        start_date: new Date().toISOString().split('T')[0],
        time_from: '09:00',
        time_to: '10:30',
        week_days_type: 'toq_kunlar',
      })
    }
  }, [open, reset])

  const onSubmit = (values: FormValues) => {
    toast.promise(
      createMutation.mutateAsync({
        name: values.name.trim(),
        course: Number(values.course),
        teacher: Number(values.teacher),
        start_date: values.start_date,
        start_time: values.time_from,
        end_time: values.time_to,
        week_days_type: values.week_days_type,
        status: 'active',
      }),
      {
        loading: 'Saqlanmoqda...',
        success: () => {
          onOpenChange(false)
          return 'Guruh yaratildi'
        },
        error: (err: { message?: string }) =>
          err?.message || 'Xatolik yuz berdi',
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          adminDialogClass,
          'flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden border-none p-0 shadow-2xl sm:max-w-[420px]'
        )}
      >
        <DialogHeader className='shrink-0 border-b px-4 py-3 sm:px-5'>
          <DialogTitle className='text-base font-bold'>Guruh qo&apos;shish</DialogTitle>
          <DialogDescription className='sr-only'>
            Yangi guruh yaratish formasi
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex min-h-0 flex-1 flex-col'
        >
          <div className='space-y-3 overflow-y-auto px-4 py-3 sm:px-5'>
            <div className='space-y-1.5'>
              <Label className={labelClasses}>Guruh nomi</Label>
              <Input
                placeholder='Nom'
                className={inputClasses}
                {...control.register('name')}
              />
              {errors.name && (
                <p className='text-[10px] font-medium text-destructive'>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className={labelClasses}>Kurs</Label>
                <Controller
                  name='course'
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={inputClasses}>
                        <SelectValue placeholder='Kurs' />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className='space-y-1.5'>
                <Label className={labelClasses}>Ustoz</Label>
                <Controller
                  name='teacher'
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={inputClasses}>
                        <SelectValue placeholder='Ustoz' />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.first_name
                              ? `${t.first_name} ${t.last_name ?? ''}`.trim()
                              : t.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className={labelClasses}>Boshlanish</Label>
              <Controller
                name='start_date'
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type='button'
                        variant='outline'
                        className={cn(
                          inputClasses,
                          'w-full justify-start font-normal'
                        )}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4 shrink-0' />
                        {field.value
                          ? format(new Date(field.value), 'dd.MM.yyyy')
                          : 'Sana'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                        }
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className={labelClasses}>Dan</Label>
                <Input
                  type='time'
                  className={inputClasses}
                  {...control.register('time_from')}
                />
              </div>
              <div className='space-y-1.5'>
                <Label className={labelClasses}>Gacha</Label>
                <Input
                  type='time'
                  className={inputClasses}
                  {...control.register('time_to')}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className={labelClasses}>Kunlar</Label>
              <Controller
                name='week_days_type'
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={inputClasses}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='toq_kunlar'>Toq kunlar</SelectItem>
                      <SelectItem value='juft_kunlar'>Juft kunlar</SelectItem>
                      <SelectItem value='har_kuni'>Har kuni</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DialogFooter className='shrink-0 gap-2 border-t px-4 py-3 sm:px-5'>
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
              type='submit'
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
