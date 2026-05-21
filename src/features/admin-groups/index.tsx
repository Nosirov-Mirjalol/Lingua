import { useMemo, useState } from 'react'
import * as z from 'zod'
import { format } from 'date-fns'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users as UsersIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Group } from '@/api/service/teacher/group.type'
import { cn } from '@/lib/utils'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { useAdminGroups } from '@/hooks/admin/groups/useAdminGroups'
import { useCreateAdminGroup } from '@/hooks/admin/groups/useCreateAdminGroup'
import { useDeleteAdminGroup } from '@/hooks/admin/groups/useDeleteAdminGroup'
import { useUpdateAdminGroup } from '@/hooks/admin/groups/useUpdateAdminGroup'
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

interface Teacher {
  id: number
  username: string
  first_name?: string
  last_name?: string
}

const formSchema = z
  .object({
    name: z.string().min(1, 'Nom kiritilishi shart'),
    course: z.string().min(1, 'Kursni tanlang'),
    teacher: z.string().min(1, 'Ustozni tanlang'),
    start_date: z.string().min(1, 'Sanani tanlang'),
    time_from: z.string().min(1, 'Vaqtni tanlang'),
    time_to: z.string().min(1, 'Vaqtni tanlang'),
    week_days_type: z.enum(['ODD', 'EVEN', 'CUSTOM']),
    days: z.array(z.string()).optional(),
  })
  .refine(
    (values) =>
      values.week_days_type !== 'CUSTOM' || Boolean(values.days?.length),
    {
      message: 'Kamida bitta kun tanlang',
      path: ['days'],
    }
  )

type FormValues = z.infer<typeof formSchema>

const DAY_MAP: Record<string, string> = {
  Du: 'Mon',
  Se: 'Tue',
  Cho: 'Wed',
  Pa: 'Thu',
  Ju: 'Fri',
  Sha: 'Sat',
  Yak: 'Sun',
}

const DAYS_LIST = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak']

// Input va Selectlar bir xil ko'rinishi uchun umumiy klasslar
const inputClasses =
  'h-11 rounded-xl border-none bg-muted px-4 text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary w-full'
const labelClasses =
  'ml-1 mb-1.5 block text-[10px] font-black tracking-widest text-muted-foreground uppercase'

export default function AdminGroupsPage() {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: groups = [], isLoading } = useAdminGroups()
  const { data: courses = [] } = useAdminCourses('')
  const { data: rawTeachersData } = useAdminTeachers()

  const createMutation = useCreateAdminGroup()
  const deleteMutation = useDeleteAdminGroup()
  const updateMutation = useUpdateAdminGroup()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
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
      days: [],
      week_days_type: 'ODD',
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

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name.trim(),
      course: Number(values.course),
      teacher: Number(values.teacher),
      start_date: values.start_date,
      start_time: values.time_from,
      end_time: values.time_to,
      week_days:
        values.week_days_type === 'CUSTOM'
          ? (values.days || []).map((d) => DAY_MAP[d]).join(',')
          : '',
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

  const onEditSubmit = (values: FormValues) => {
    if (!editingGroup) return

    const payload = {
      name: values.name.trim(),
      course: Number(values.course),
      teacher: Number(values.teacher),
      start_date: values.start_date,
      start_time: values.time_from,
      end_time: values.time_to,
      week_days:
        values.week_days_type === 'CUSTOM'
          ? (values.days || []).map((d) => DAY_MAP[d]).join(',')
          : '',
      week_days_type: values.week_days_type,
      status: 'active' as const,
    }

    toast.promise(
      updateMutation.mutateAsync({ id: editingGroup.id, data: payload as any }),
      {
        loading: 'Yangilanmoqda...',
        success: () => {
          setEditOpen(false)
          setEditingGroup(null)
          reset()
          return 'Guruh yangilandi'
        },
        error: 'Xatolik yuz berdi',
      }
    )
  }

  const handleEditClick = (group: Group) => {
    setEditingGroup(group)
    reset({
      name: group.name,
      course: String(group.course),
      teacher: String(group.teacher),
      start_date: group.start_date || new Date().toISOString().split('T')[0],
      time_from: group.start_time || '09:00',
      time_to: group.end_time || '10:30',
      days: [],
      week_days_type: 'ODD',
    })
    setEditOpen(true)
  }

  return (
    <>
      <AdminHeader fixed>
        <ConfigDrawer />
      </AdminHeader>
      <Main className='bg-background font-outfit'>
        <div className='container mx-auto max-w-6xl px-6 py-10'>
          {/* Header Qismi */}
          <div className='mb-12 flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-foreground'>Guruhlar</h1>
              <p className='text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase'>
                Boshqaruv paneli
              </p>
            </div>
            <RoseButton
              onClick={() => {
                reset()
                setCreateOpen(true)
              }}
            >
              <Plus className='mr-2 h-4 w-4' /> Qo'shish
            </RoseButton>
          </div>

          {/* Qidiruv Qismi */}
          <div className='relative mb-8 max-w-md'>
            <Search className='absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Qidirish...'
              className='h-11 rounded-full border-none bg-muted pl-11 text-sm font-medium focus-visible:ring-1'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Ro'yxat Qismi */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {isLoading ? (
              <div className='col-span-full py-20 text-center'>
                <Loader2 className='inline-block animate-spin text-muted-foreground' />
              </div>
            ) : filtered.length === 0 ? (
              <div className='col-span-full py-20 text-center text-xs font-medium text-muted-foreground'>
                Guruhlar topilmadi
              </div>
            ) : (
              filtered.map((group) => (
                <div
                  key={group.id}
                  className='group relative rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg'
                >
                  <div className='mb-4 flex items-start justify-between'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                      <UsersIcon className='h-6 w-6' />
                    </div>
                    <div className='flex gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary'
                        onClick={() => {
                          setEditingGroup(group)
                          setEditOpen(true)
                        }}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive'
                        onClick={() => setDeleteId(group.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>

                  <h3 className='mb-2 text-base font-bold text-foreground'>
                    {group.name}
                  </h3>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <span className='font-semibold'>ID:</span>
                      <span>#{group.id}</span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <span className='font-semibold'>Kurs:</span>
                      <span>#{group.course}</span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <span className='font-semibold'>Ustoz:</span>
                      <span>#{group.teacher}</span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <span className='font-semibold'>Kunlar:</span>
                      <span>{group.week_days || '—'}</span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <span className='font-semibold'>Vaqt:</span>
                      <span>
                        {group.start_time} - {group.end_time}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <span className='font-semibold'>Holat:</span>
                      <span
                        className={
                          group.status === 'active'
                            ? 'font-semibold text-green-600'
                            : 'text-muted-foreground'
                        }
                      >
                        {group.status === 'active' ? 'Faol' : 'Tugatilgan'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Qismi */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className='rounded-4xl border-none bg-card p-8 shadow-2xl sm:max-w-110'>
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

              <div className='grid grid-cols-2 gap-4'>
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
              <div className='grid grid-cols-2 gap-4'>
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

              {/* Dars Kunlari */}
              <div>
                <Label className={labelClasses}>Dars kunlari turi</Label>
                <Controller
                  name='week_days_type'
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={inputClasses}>
                        <SelectValue placeholder='Tanlang' />
                      </SelectTrigger>
                      <SelectContent className='rounded-xl border-border'>
                        <SelectItem
                          value='ODD'
                          className='rounded-lg py-2 font-medium'
                        >
                          Toq kunlar (Du, Cho, Ju)
                        </SelectItem>
                        <SelectItem
                          value='EVEN'
                          className='rounded-lg py-2 font-medium'
                        >
                          Juft kunlar (Se, Pa, Sha)
                        </SelectItem>
                        <SelectItem
                          value='CUSTOM'
                          className='rounded-lg py-2 font-medium'
                        >
                          Boshqa (Tanlash)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />

                {watch('week_days_type') === 'CUSTOM' && (
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {DAYS_LIST.map((day) => {
                      const selected = watch('days') || []
                      const isSelected = selected.includes(day)
                      return (
                        <button
                          key={day}
                          type='button'
                          onClick={() =>
                            setValue(
                              'days',
                              isSelected
                                ? selected.filter((d) => d !== day)
                                : [...selected, day],
                              { shouldValidate: true }
                            )
                          }
                          className={cn(
                            'h-9 rounded-lg px-3 text-xs font-bold transition-all',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          )}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Tugmalar */}
              <DialogFooter className='gap-3 pt-4'>
                <Button
                  variant='ghost'
                  type='button'
                  onClick={() => setCreateOpen(false)}
                  className='h-11 flex-1 rounded-xl font-bold'
                >
                  Bekor qilish
                </Button>
                <RoseButton
                  type='submit'
                  disabled={createMutation.isPending}
                  className='h-11 flex-1 rounded-xl'
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

        {/* Edit Modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className='rounded-4xl border-none bg-card p-8 shadow-2xl sm:max-w-110'>
            <DialogHeader className='mb-6'>
              <DialogTitle className='text-xl font-bold'>
                Guruhni tahrirlash
              </DialogTitle>
            </DialogHeader>

            {editingGroup && (
              <form onSubmit={handleSubmit(onEditSubmit)} className='space-y-5'>
                {/* Nomi */}
                <div>
                  <Label className={labelClasses}>Guruh nomi</Label>
                  <Input
                    defaultValue={editingGroup.name}
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

                <div className='grid grid-cols-2 gap-4'>
                  {/* Kurs */}
                  <div>
                    <Label className={labelClasses}>Kurs</Label>
                    <Controller
                      name='course'
                      control={control}
                      defaultValue={String(editingGroup.course)}
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
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.course && (
                      <p className='mt-1 text-[10px] font-bold text-destructive'>
                        {errors.course.message}
                      </p>
                    )}
                  </div>

                  {/* Ustoz */}
                  <div>
                    <Label className={labelClasses}>Ustoz</Label>
                    <Controller
                      name='teacher'
                      control={control}
                      defaultValue={String(editingGroup.teacher)}
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
                              <SelectItem key={t.id} value={String(t.id)}>
                                {t.first_name} {t.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.teacher && (
                      <p className='mt-1 text-[10px] font-bold text-destructive'>
                        {errors.teacher.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tugmalar */}
                <DialogFooter className='gap-3 pt-4'>
                  <Button
                    variant='ghost'
                    type='button'
                    onClick={() => setEditOpen(false)}
                    className='h-11 flex-1 rounded-xl font-bold'
                  >
                    Bekor qilish
                  </Button>
                  <RoseButton
                    type='submit'
                    disabled={updateMutation.isPending}
                    className='h-11 flex-1 rounded-xl'
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      'Saqlash'
                    )}
                  </RoseButton>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <DeleteConfirmDialog
          open={deleteId !== null}
          onOpenChange={(v) => !v && setDeleteId(null)}
          onConfirm={() => {
            if (deleteId)
              toast.promise(deleteMutation.mutateAsync(deleteId), {
                loading: "O'chirilmoqda...",
                success: "O'chirildi",
                error: 'Xato',
              })
          }}
          isLoading={deleteMutation.isPending}
        />
      </Main>
    </>
  )
}
