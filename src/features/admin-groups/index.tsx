import { useMemo, useState } from 'react'
import * as z from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Search, Trash2, Users as UsersIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { Group } from '@/api/service/teacher/group.type'
import { cn } from '@/lib/utils'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { useAdminGroups } from '@/hooks/admin/groups/useAdminGroups'
import { useCreateAdminGroup } from '@/hooks/admin/groups/useCreateAdminGroup'
import { useDeleteAdminGroup } from '@/hooks/admin/groups/useDeleteAdminGroup'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'
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

export default function AdminGroupsPage() {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: groups = [], isLoading } = useAdminGroups()
  const { data: courses = [] } = useAdminCourses('')
  const { data: rawTeachersData } = useAdminTeachers()

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
    let list: Teacher[] = []
    if (Array.isArray(rawTeachersData)) {
      list = rawTeachersData as Teacher[]
    } else if (rawTeachersData && typeof rawTeachersData === 'object') {
      const anyRaw = rawTeachersData as any
      list =
        anyRaw.results ??
        anyRaw.data ??
        anyRaw.teachers ??
        anyRaw.user_list ??
        []
    }
    return list.filter((t) => t.id != null)
  }, [rawTeachersData])

  const createMutation = useCreateAdminGroup()
  const deleteMutation = useDeleteAdminGroup()

  const filtered = useMemo<Group[]>(() => {
    const q = search.trim().toLowerCase()
    const list = Array.isArray(groups) ? groups : []
    return list.filter((g) => g.name.toLowerCase().includes(q))
  }, [groups, search])

  const onSubmit = (values: FormValues) => {
    const engDays = (values.days || []).map((d) => DAY_MAP[d])
    const payload = {
      name: values.name.trim(),
      course: Number(values.course),
      teacher: Number(values.teacher),
      start_date: values.start_date,
      start_time: values.time_from,
      end_time: values.time_to,
      week_days: values.week_days_type === 'CUSTOM' ? engDays.join(',') : '',
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
      error: (err: any) => {
        console.error('GROUP CREATE ERROR:', JSON.stringify(err, null, 2))
        const errorData = err?.data ?? err?.response?.data ?? err
        if (typeof errorData === 'object' && errorData !== null) {
          const messages = Object.entries(errorData)
            .map(
              ([k, v]) =>
                `${k}: ${Array.isArray(v) ? v.join(', ') : JSON.stringify(v)}`
            )
            .join('\n')
          return messages || 'Xatolik yuz berdi'
        }
        return String(err?.message ?? 'Xatolik yuz berdi')
      },
    })
  }

  return (
    <>
      <AdminHeader fixed />
      <Main className='bg-background font-outfit'>
        <div className='container mx-auto max-w-6xl px-6 py-10'>
          <div className='mb-12 flex items-center justify-between'>
            <div className='space-y-1'>
              <h1 className='text-2xl font-black text-rose-700 dark:text-rose-400'>
                Guruhlar
              </h1>
              <p className='text-[10px] font-black tracking-[0.2em] text-rose-500 uppercase'>
                Boshqaruv paneli
              </p>
            </div>
            <Button
              onClick={() => {
                reset()
                setCreateOpen(true)
              }}
              className='h-11 rounded-full bg-rose-600 px-6 text-xs font-black text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700 dark:shadow-none'
            >
              <Plus className='mr-2 h-4 w-4' /> Qo'shish
            </Button>
          </div>

          <div className='relative mb-8 max-w-md'>
            <Search className='absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-rose-400' />
            <Input
              placeholder='Qidirish...'
              className='h-11 rounded-full border border-rose-100 bg-rose-50/60 pl-11 text-sm font-bold focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-rose-900/50 dark:bg-rose-950/20'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            {isLoading ? (
              <div className='py-20 text-center'>
                <Loader2 className='inline-block animate-spin text-rose-500' />
              </div>
            ) : filtered.length === 0 ? (
              <div className='rounded-3xl border border-dashed border-rose-200 bg-rose-50/60 py-20 text-center text-xs font-black text-rose-500 dark:border-rose-900/60 dark:bg-rose-950/20'>
                Guruhlar topilmadi
              </div>
            ) : (
              <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
                {filtered.map((group) => (
                  <div
                    key={group.id}
                    className='group flex min-h-[260px] flex-col justify-between rounded-[28px] border border-rose-100 bg-card p-5 shadow-sm shadow-rose-100/70 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100 dark:border-rose-950/70 dark:shadow-none dark:hover:border-rose-800'
                  >
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none'>
                        <UsersIcon className='h-5 w-5' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='mb-1 line-clamp-1 text-base font-black text-foreground'>
                          {group.name}
                        </div>
                        <div className='flex items-center gap-3'>
                          <span className='text-[10px] font-black tracking-widest text-rose-500 uppercase'>
                            ID #{group.id}
                          </span>
                          <span className='h-1 w-1 rounded-full bg-rose-300'></span>
                          <span className='text-[10px] font-black text-rose-500 uppercase'>
                            Kurs #{group.course}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='mt-5 space-y-3 text-xs font-black'>
                      <div className='rounded-2xl bg-rose-50/70 p-4 dark:bg-rose-950/20'>
                        <div className='text-[10px] font-black tracking-widest text-rose-500 uppercase'>
                          Ustoz
                        </div>
                        <div className='mt-1 line-clamp-1 text-sm font-black text-rose-950 dark:text-rose-100'>
                          {group.teacher_name || `Ustoz #${group.teacher}`}
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='rounded-2xl border border-rose-100 p-3 dark:border-rose-950/70'>
                          <div className='text-[10px] font-black tracking-widest text-rose-500 uppercase'>
                            Jadval
                          </div>
                          <div className='mt-1 line-clamp-1 text-xs font-black text-foreground'>
                            {Array.isArray(group.week_days)
                              ? group.week_days.join(', ')
                              : group.week_days || '—'}
                          </div>
                        </div>
                        <div className='rounded-2xl border border-rose-100 p-3 dark:border-rose-950/70'>
                          <div className='text-[10px] font-black tracking-widest text-rose-500 uppercase'>
                            Vaqt
                          </div>
                          <div className='mt-1 text-xs font-black text-foreground'>
                            {group.start_time?.slice(0, 5) || '--:--'} -{' '}
                            {group.end_time?.slice(0, 5) || '--:--'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='mt-4 flex justify-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-9 w-9 rounded-full text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950'
                        onClick={() => setDeleteId(group.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className='rounded-[32px] border-none bg-card p-8 shadow-2xl sm:max-w-[440px]'>
            <DialogHeader className='mb-8'>
              <DialogTitle className='text-xl font-bold text-foreground'>
                Guruh qo'shish
              </DialogTitle>
              <p className='text-xs font-medium text-muted-foreground'>
                Barcha maydonlarni to'ldiring
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <div className='space-y-2'>
                <Label className='ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase'>
                  Guruh nomi
                </Label>
                <Input
                  placeholder='Nom kiriting'
                  className='h-12 rounded-2xl border-none bg-muted px-5 text-sm font-bold'
                  {...control.register('name')}
                />
                {errors.name && (
                  <p className='ml-2 text-[10px] font-bold text-destructive'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase'>
                    Kurs
                  </Label>
                  <Controller
                    name='course'
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className='h-12 rounded-2xl border-none bg-slate-50 px-5 font-bold dark:bg-slate-800 dark:text-slate-100'>
                          <SelectValue placeholder='Tanlang' />
                        </SelectTrigger>
                        <SelectContent className='rounded-2xl border-border'>
                          {courses.map((c) => (
                            <SelectItem
                              key={c.id}
                              value={String(c.id)}
                              className='rounded-xl py-2.5 font-bold'
                            >
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase'>
                    Ustoz
                  </Label>
                  <Controller
                    name='teacher'
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className='h-12 rounded-2xl border-none bg-slate-50 px-5 font-bold dark:bg-slate-800 dark:text-slate-100'>
                          <SelectValue placeholder='Tanlang' />
                        </SelectTrigger>
                        <SelectContent className='rounded-2xl border-border'>
                          {teachers.map((t) => (
                            <SelectItem
                              key={t.id}
                              value={String(t.id)}
                              className='rounded-xl py-2.5 font-bold'
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

              <div className='space-y-2'>
                <Label className='ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase'>
                  Boshlanish sanasi
                </Label>
                <Input
                  type='date'
                  className='h-12 rounded-2xl border-none bg-muted px-5 font-bold'
                  {...control.register('start_date')}
                />
              </div>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label className='ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase'>
                    Dars kunlari turi
                  </Label>
                  <Controller
                    name='week_days_type'
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className='h-12 rounded-2xl border-none bg-slate-50 px-5 font-bold dark:bg-slate-800 dark:text-slate-100'>
                          <SelectValue placeholder='Tanlang' />
                        </SelectTrigger>
                        <SelectContent className='rounded-2xl border-border'>
                          <SelectItem
                            value='ODD'
                            className='rounded-xl py-2.5 font-bold'
                          >
                            Toq kunlar (Du, Cho, Ju)
                          </SelectItem>
                          <SelectItem
                            value='EVEN'
                            className='rounded-xl py-2.5 font-bold'
                          >
                            Juft kunlar (Se, Pa, Sha)
                          </SelectItem>
                          <SelectItem
                            value='CUSTOM'
                            className='rounded-xl py-2.5 font-bold'
                          >
                            Boshqa
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {watch('week_days_type') === 'CUSTOM' && (
                  <div className='space-y-3'>
                    <Label className='ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase'>
                      Kunlarni tanlang
                    </Label>
                    <div className='flex flex-wrap gap-2'>
                      {['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak'].map(
                        (day) => {
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
                                'h-10 rounded-xl px-4 text-[11px] font-black transition-all',
                                isSelected
                                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              )}
                            >
                              {day}
                            </button>
                          )
                        }
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase'>
                    Vaqti (Dan)
                  </Label>
                  <Input
                    type='time'
                    className='h-12 rounded-2xl border-none bg-muted px-5 font-bold'
                    {...control.register('time_from')}
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase'>
                    Vaqti (Gacha)
                  </Label>
                  <Input
                    type='time'
                    className='h-12 rounded-2xl border-none bg-muted px-5 font-bold'
                    {...control.register('time_to')}
                  />
                </div>
              </div>

              <DialogFooter className='gap-3 pt-6'>
                <Button
                  variant='ghost'
                  type='button'
                  onClick={() => setCreateOpen(false)}
                  className='h-12 flex-1 rounded-2xl font-bold text-muted-foreground'
                >
                  Bekor qilish
                </Button>
                <Button
                  type='submit'
                  disabled={createMutation.isPending}
                  className='h-12 flex-1 rounded-2xl bg-primary font-bold text-primary-foreground transition-all hover:bg-primary/90'
                >
                  {createMutation.isPending ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    'Saqlash'
                  )}
                </Button>
              </DialogFooter>
            </form>
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
