import * as z from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminCourse } from '@/api/service/admin/course.service'
import type { AdminGroupCreatePayload } from '@/api/service/admin/group.service'
import { cn } from '@/lib/utils'
import { useCreateAdminGroup } from '@/hooks/admin/groups/useCreateAdminGroup'
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

interface TeacherGroupModalProps {
  isOpen: boolean
  onClose: () => void
  teacherId: number
  teacherName: string
  courses: AdminCourse[]
}

const formSchema = z.object({
  name: z.string().min(1, 'Nom kiritilishi shart'),
  course: z.string().min(1, 'Kursni tanlang'),
  start_date: z.string().min(1, 'Sanani tanlang'),
  time_from: z.string().min(1, 'Vaqtni tanlang'),
  time_to: z.string().min(1, 'Vaqtni tanlang'),
  week_days_type: z.enum(['toq_kunlar', 'juft_kunlar', 'har_kuni']),
})

type FormValues = z.infer<typeof formSchema>

export function TeacherGroupModal({
  isOpen,
  onClose,
  teacherId,
  teacherName,
  courses,
}: TeacherGroupModalProps) {
  const createMutation = useCreateAdminGroup()
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
      start_date: new Date().toISOString().split('T')[0],
      time_from: '09:00',
      time_to: '10:30',
      week_days_type: 'toq_kunlar',
    },
  })

  const onSubmit = (values: FormValues) => {
    const payload: AdminGroupCreatePayload = {
      name: values.name.trim(),
      course: Number(values.course),
      teacher: teacherId,
      start_date: values.start_date,
      start_time: values.time_from,
      end_time: values.time_to,
      week_days_type: values.week_days_type,
      status: 'active',
    }

    toast.promise(createMutation.mutateAsync(payload), {
      loading: 'Yaratilmoqda...',
      success: () => {
        reset()
        onClose()
        return 'Guruh yaratildi'
      },
      error: 'Xatolik yuz berdi',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>
            Guruh qo'shish - {teacherName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Guruh nomi *</Label>
            <Controller
              control={control}
              name='name'
              render={({ field }) => (
                <Input
                  {...field}
                  id='name'
                  placeholder='Guruh nomini kiriting'
                  className={cn(errors.name && 'border-destructive')}
                />
              )}
            />
            {errors.name && (
              <p className='text-xs text-destructive'>{errors.name.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='course'>Kurs *</Label>
            <Controller
              control={control}
              name='course'
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    className={cn(errors.course && 'border-destructive')}
                  >
                    <SelectValue placeholder='Kursni tanlang' />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.course && (
              <p className='text-xs text-destructive'>
                {errors.course.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='start_date'>Boshlanish sanasi *</Label>
            <Controller
              control={control}
              name='start_date'
              render={({ field }) => (
                <Input
                  {...field}
                  id='start_date'
                  type='date'
                  className={cn(errors.start_date && 'border-destructive')}
                />
              )}
            />
            {errors.start_date && (
              <p className='text-xs text-destructive'>
                {errors.start_date.message}
              </p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='time_from'>Boshlanish vaqti *</Label>
              <Controller
                control={control}
                name='time_from'
                render={({ field }) => (
                  <Input
                    {...field}
                    id='time_from'
                    type='time'
                    className={cn(errors.time_from && 'border-destructive')}
                  />
                )}
              />
              {errors.time_from && (
                <p className='text-xs text-destructive'>
                  {errors.time_from.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='time_to'>Tugash vaqti *</Label>
              <Controller
                control={control}
                name='time_to'
                render={({ field }) => (
                  <Input
                    {...field}
                    id='time_to'
                    type='time'
                    className={cn(errors.time_to && 'border-destructive')}
                  />
                )}
              />
              {errors.time_to && (
                <p className='text-xs text-destructive'>
                  {errors.time_to.message}
                </p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Davrlar turi *</Label>
            <Controller
              control={control}
              name='week_days_type'
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
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

          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='rounded-full'
            >
              Bekor qilish
            </Button>
            <Button
              type='submit'
              className='rounded-full bg-primary text-white hover:bg-primary/90'
            >
              <Plus className='mr-2 h-4 w-4' /> Qo'shish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
