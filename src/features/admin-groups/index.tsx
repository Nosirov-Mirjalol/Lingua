import { useMemo, useState } from 'react'
import * as z from 'zod'
import { format } from 'date-fns'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarIcon,
  Loader2,
  Plus,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Group } from '@/api/service/teacher/group.type'
import { cn } from '@/lib/utils'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { useAdminGroups } from '@/hooks/admin/groups/useAdminGroups'
import { useCreateAdminGroup } from '@/hooks/admin/groups/useCreateAdminGroup'
import { useDeleteAdminGroup } from '@/hooks/admin/groups/useDeleteAdminGroup'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import { ConfigDrawer } from '@/components/config-drawer'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { AdminGroupCard } from '@/features/admin-groups/components/admin-group-card'
import {
  adminDialogClass,
  adminInputClass,
  adminLabelClass,
  adminPageSubtitleClass,
  adminPageTitleClass,
} from '@/lib/admin-ui'

interface Teacher {
  id: number
  username: string
  first_name?: string
  last_name?: string
}

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
  'h-11 border-none bg-muted px-4 focus-visible:ring-1 focus-visible:ring-primary'
)
const labelClasses = cn(adminLabelClass, 'ml-1')

export default function AdminGroupsPage() {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: groups = [], isLoading } = useAdminGroups()
  const { data: courses = [] } = useAdminCourses('')
  const { data: rawTeachersData } = useAdminTeachers()

  const createMutation = useCreateAdminGroup()
  const deleteMutation = useDeleteAdminGroup()

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

  const teachers = useMemo<Teacher[]>(() => {
    const data: any = rawTeachersData
    const list = Array.isArray(data)
      ? data
      : (data?.results ?? data?.data ?? data?.teachers ?? data?.user_list ?? [])
    return list.filter((t: Teacher) => t.id != null)
  }, [rawTeachersData])

  const filtered = useMemo<Group[]>(() => {
    const q = search.trim().toLowerCase()
    return (Array.isArray(groups) ? groups : []).filter((g) =>
      g.name.toLowerCase().includes(q)
    )
  }, [groups, search])

  const courseNameById = useMemo(() => {
    const map = new Map<number, string>()
    for (const c of courses) map.set(c.id, c.name)
    return map
  }, [courses])

  const teacherNameById = useMemo(() => {
    const map = new Map<number, string>()
    for (const t of teachers) {
      const name = t.first_name
        ? `${t.first_name} ${t.last_name ?? ''}`.trim()
        : t.username
      map.set(t.id, name)
    }
    return map
  }, [teachers])

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name.trim(),
      course: Number(values.course),
      teacher: Number(values.teacher),
      start_date: values.start_date,
      start_time: values.time_from,
      end_time: values.time_to,
      week_days_type: values.week_days_type,
      status: 'active' as const,
    }

    toast.promise(createMutation.mutateAsync(payload as any), {
      loading: 'Saqlanmoqda...',
      success: () => {
        setCreateOpen(false)
        reset()
        return 'Guruh yaratildi'
      },
      error: 'Xatolik yuz berdi',
    })
  }

  return (
    <>
      <AdminHeader fixed>
        <ConfigDrawer />
      </AdminHeader>
      <Main className='admin-page bg-background font-outfit'>
        <div className='admin-page__container'>
          <header className='admin-page__header'>
            <div>
              <h1 className={adminPageTitleClass}>Guruhlar</h1>
              <p className={adminPageSubtitleClass}>Boshqaruv paneli</p>
            </div>
            <RoseButton
              className='admin-page__cta shrink-0'
              onClick={() => {
                reset()
                setCreateOpen(true)
              }}
            >
              <Plus className='mr-2 h-4 w-4' /> Qo'shish
            </RoseButton>
          </header>

          <div className='admin-page__toolbar'>
            <div className='admin-page__search-wrap'>
              <Search className='absolute top-1/2 left-4 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Guruh qidirish...'
                className={cn(adminInputClass, 'h-11 border-none bg-muted pl-11 focus-visible:ring-1')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className='admin-page__grid admin-page__grid--groups'>
            {isLoading ? (
              <div className='admin-page__grid-empty flex justify-center py-16 sm:py-20'>
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              </div>
            ) : filtered.length === 0 ? (
              <div className='admin-page__grid-empty py-16 text-center text-sm font-medium text-muted-foreground sm:py-20'>
                Guruhlar topilmadi
              </div>
            ) : (
              filtered.map((group) => (
                <AdminGroupCard
                  key={group.id}
                  group={group}
                  courseName={
                    courseNameById.get(group.course) ?? `Kurs #${group.course}`
                  }
                  teacherName={
                    teacherNameById.get(group.teacher) ??
                    group.teacher_name ??
                    `Ustoz #${group.teacher}`
                  }
                  onDelete={() => setDeleteId(group.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Modal Qismi */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent
            className={cn(
              adminDialogClass,
              'border-none bg-card p-6 shadow-2xl sm:max-w-110 sm:p-8'
            )}
          >
            <DialogHeader className='mb-6'>
              <DialogTitle className='text-xl font-bold'>
                Guruh qo'shish
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
              {/* Nomi */}
              <div>
                <Label className={labelClasses}>Guruh nomi</Label>
                <Input
                  placeholder='Nom kiriting'
                  className={inputClasses}
                  {...control.register('name')}
                />
                {errors.name && (
                  <p className='mt-1 text-[10px] font-bold text-destructive'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className='admin-dialog__form-grid grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {/* Kurs */}
                <div>
                  <Label className={labelClasses}>Kurs</Label>
                  <Controller
                    name='course'
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className={inputClasses}>
                          <SelectValue placeholder='Tanlang' />
                        </SelectTrigger>
                        <SelectContent className='rounded-xl border-border'>
                          {courses.map((c) => (
                            <SelectItem
                              key={c.id}
                              value={String(c.id)}
                              className='rounded-lg py-2 font-medium'
                            >
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Ustoz */}
                <div>
                  <Label className={labelClasses}>Ustoz</Label>
                  <Controller
                    name='teacher'
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className={inputClasses}>
                          <SelectValue placeholder='Tanlang' />
                        </SelectTrigger>
                        <SelectContent className='rounded-xl border-border'>
                          {teachers.map((t) => (
                            <SelectItem
                              key={t.id}
                              value={String(t.id)}
                              className='rounded-lg py-2 font-medium'
                            >
                              {t.first_name
                                ? `${t.first_name} ${t.last_name ?? ''}`
                                : t.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Sanasi (Shadcn Calendar bilan) */}
              <div>
                <Label className={labelClasses}>Boshlanish sanasi</Label>
                <Controller
                  name='start_date'
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            inputClasses,
                            'justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {field.value ? (
                            format(new Date(field.value), 'dd/MM/yyyy')
                          ) : (
                            <span>Sanani tanlang</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(
                              date ? format(date, 'yyyy-MM-dd') : ''
                            )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              {/* Vaqti */}
              <div className='admin-dialog__form-grid grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <Label className={labelClasses}>Vaqti (Dan)</Label>
                  <Input
                    type='time'
                    className={inputClasses}
                    {...control.register('time_from')}
                  />
                </div>
                <div>
                  <Label className={labelClasses}>Vaqti (Gacha)</Label>
                  <Input
                    type='time'
                    className={inputClasses}
                    {...control.register('time_to')}
                  />
                </div>
              </div>

              {/* Davrlar turi */}
              <div>
                <Label className={labelClasses}>Davrlar turi</Label>
                <Controller
                  control={control}
                  name='week_days_type'
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className={inputClasses}>
                        <SelectValue placeholder='Tanlang' />
                      </SelectTrigger>
                      <SelectContent className='rounded-xl border-border'>
                        <SelectItem value='toq_kunlar'>Toq kunlar</SelectItem>
                        <SelectItem value='juft_kunlar'>Juft kunlar</SelectItem>
                        <SelectItem value='har_kuni'>Har kuni</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Tugmalar */}
              <DialogFooter className='flex flex-col-reverse gap-3 pt-4 sm:flex-row'>
                <Button
                  variant='ghost'
                  type='button'
                  onClick={() => setCreateOpen(false)}
                  className='h-11 w-full sm:flex-1'
                >
                  Bekor qilish
                </Button>
                <RoseButton
                  type='submit'
                  disabled={createMutation.isPending}
                  className='h-11 w-full sm:flex-1'
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

        <DeleteConfirmDialog
          open={deleteId !== null}
          onOpenChange={(v) => !v && setDeleteId(null)}
          onConfirm={() => {
            if (!deleteId) return
            toast.promise(deleteMutation.mutateAsync(deleteId), {
              loading: "O'chirilmoqda...",
              success: () => {
                setDeleteId(null)
                return "O'chirildi"
              },
              error: (err: unknown) =>
                (err as Error)?.message || 'Xatolik yuz berdi',
            })
          }}
          isLoading={deleteMutation.isPending}
        />
      </Main>
    </>
  )
}
