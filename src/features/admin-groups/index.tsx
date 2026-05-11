import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Group } from '@/api/service/teacher/group.type'
import { useAdminGroups } from '@/hooks/admin/groups/useAdminGroups'
import { useCreateAdminGroup } from '@/hooks/admin/groups/useCreateAdminGroup'
import { useDeleteAdminGroup } from '@/hooks/admin/groups/useDeleteAdminGroup'
import { useUpdateAdminGroup } from '@/hooks/admin/groups/useUpdateAdminGroup'
import { useAddStudentToGroup } from '@/hooks/teacher/groups/useAddStudentToGroup'
import { useRemoveStudentFromGroup } from '@/hooks/teacher/groups/useRemoveStudentFromGroup'
import { useStudents } from '@/hooks/teacher/students/useStudents'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type GroupFormState = {
  name: string
  course: string
  teacher_username: string
  start_date: string
}

// API error data ni o'qib chiqarish
const formatApiErrorDetails = (data: unknown): string => {
  if (data == null) return ''
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.map(String).join(', ')
  if (typeof data === 'object') {
    const record = data as Record<string, unknown>
    return Object.entries(record)
      .map(([k, v]) => {
        if (Array.isArray(v)) return `${k}: ${v.map(String).join(', ')}`
        if (v && typeof v === 'object') return `${k}: ${JSON.stringify(v)}`
        return `${k}: ${String(v)}`
      })
      .join(' | ')
  }
  return String(data)
}

// Formni validatsiya qilish — xato xabarni qaytaradi yoki null
const validateGroupForm = (form: GroupFormState): string | null => {
  if (!form.name.trim()) return 'Guruh nomi kiritilmadi'

  const courseId = Number(form.course)
  if (!form.course || !Number.isFinite(courseId) || courseId <= 0)
    return "Course ID noto'g'ri"

  if (!form.teacher_username.trim())
    return "O'qituvchi username kiritilmadi"

  if (!form.start_date.trim()) return 'Sana kiritilmadi'

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.start_date.trim()))
    return "Sana formati xato. To'g'ri format: YYYY-MM-DD"

  const year = Number(form.start_date.split('-')[0])
  if (year < 2000 || year > 2100)
    return "Yilni to'g'ri kiriting (masalan: 2025)"

  return null
}

function GroupFormDialog({
  open,
  onOpenChange,
  title,
  initial,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  initial?: Partial<GroupFormState>
  onSubmit: (data: GroupFormState) => void
  isSubmitting: boolean
}) {
  const [form, setForm] = useState<GroupFormState>({
    name: '',
    course: '',
    teacher_username: '',
    start_date: '',
  })

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name ?? '',
        course: initial?.course ? String(initial.course) : '',
        teacher_username: initial?.teacher_username?.trim() ?? '',
        start_date: initial?.start_date ?? '',
      })
    }
  }, [
    open,
    initial?.name,
    initial?.course,
    initial?.teacher_username,
    initial?.start_date,
  ])

  const handleSubmit = () => {
    const error = validateGroupForm(form)
    if (error) {
      toast.error(error)
      return
    }
    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='border-t-4 border-[#e11d48] p-5 sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold text-slate-800'>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className='grid gap-3 py-2'>
          <div className='space-y-1'>
            <label className='text-xs font-semibold text-slate-700'>
              Guruh nomi
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder='IELTS Foundation'
              className='h-9 focus-visible:ring-[#e11d48]'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <label className='text-xs font-semibold text-slate-700'>
                Course ID
              </label>
              <Input
                value={form.course}
                onChange={(e) =>
                  setForm((p) => ({ ...p, course: e.target.value }))
                }
                type='number'
                min={1}
                placeholder='1'
                className='h-9 focus-visible:ring-[#e11d48]'
              />
            </div>
            <div className='space-y-1'>
              <label className='text-xs font-semibold text-slate-700'>
                O'qituvchi username
              </label>
              <Input
                value={form.teacher_username}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    teacher_username: e.target.value.trimStart(),
                  }))
                }
                type='text'
                autoComplete='username'
                placeholder='masalan: ali_teacher'
                className='h-9 focus-visible:ring-[#e11d48]'
              />
            </div>
          </div>

          <div className='space-y-1'>
            <label className='text-xs font-semibold text-slate-700'>
              Boshlanish sanasi
            </label>
            <Input
              type='date'
              value={form.start_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, start_date: e.target.value }))
              }
              className='h-9 focus-visible:ring-[#e11d48]'
            />
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Bekor qilish
          </Button>
          <Button
            size='sm'
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='bg-[#e11d48] text-white hover:bg-[#be123c]'
          >
            {isSubmitting ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              'Saqlash'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminGroupsPage() {
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [selectedStudentUsername, setSelectedStudentUsername] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const { data: groups = [], isLoading, isError } = useAdminGroups()
  const createMutation = useCreateAdminGroup()
  const deleteMutation = useDeleteAdminGroup()
  const updateMutation = useUpdateAdminGroup(selectedGroup?.id ?? 0)
  const { data: allStudents = [] } = useStudents(selectedGroup?.id)
  const addStudentMutation = useAddStudentToGroup(selectedGroup?.id ?? 0)
  const removeStudentMutation = useRemoveStudentFromGroup(selectedGroup?.id ?? 0)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groups
    return groups.filter((g) => g.name.toLowerCase().includes(q))
  }, [groups, search])

  // API xato xabarini to'g'ri ko'rsatish
  const getErrorMessage = (error: unknown): string => {
    const err = error as { message?: string; status?: number; data?: unknown }
    const details = formatApiErrorDetails(err?.data)
    if (details) return `${err?.message ?? 'Xato'} | ${details}`
    return err?.message ?? 'Xato yuz berdi'
  }

  const handleCreate = (form: GroupFormState) => {
    const payload = {
      name: form.name.trim(),
      course: Number(form.course),
      teacherUsername: form.teacher_username.trim(),
      start_date: form.start_date.trim(),
    }

    toast.promise(createMutation.mutateAsync(payload), {
      loading: 'Yaratilmoqda...',
      success: () => {
        setCreateOpen(false)
        return 'Guruh yaratildi'
      },
      error: (err) => getErrorMessage(err),
    })
  }

  const handleEdit = (form: GroupFormState) => {
    if (!selectedGroup) return

    const payload = {
      name: form.name.trim(),
      course: Number(form.course),
      teacherUsername: form.teacher_username.trim(),
      start_date: form.start_date.trim(),
    }

    toast.promise(updateMutation.mutateAsync(payload), {
      loading: 'Yangilanilmoqda...',
      success: () => {
        setEditOpen(false)
        setSelectedGroup(null)
        return 'Guruh yangilandi'
      },
      error: (err) => getErrorMessage(err),
    })
  }

  const handleDelete = (groupId: number) => {
    if (!confirm('Ochirishga ishonchingiz komilmi?')) return
    toast.promise(deleteMutation.mutateAsync(groupId), {
      loading: 'Ochirilmoqda...',
      success: 'Guruh ochirildi',
      error: (err) => getErrorMessage(err),
    })
  }

  // --- RENDERING: Details View ---
  if (selectedGroup && !editOpen) {
    return (
      <div className='container mx-auto max-w-5xl animate-in p-4 duration-300 fade-in'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setSelectedGroup(null)}
          className='mb-4 h-8 px-2 hover:text-[#e11d48]'
        >
          <ChevronLeft className='mr-1 h-4 w-4' /> Orqaga
        </Button>

        <div className='mb-6 flex flex-col items-start justify-between gap-4 md:flex-row'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-black text-slate-900'>
              {selectedGroup.name}
            </h1>
            <div className='flex gap-2'>
              <Badge
                variant='outline'
                className='border-none bg-rose-50 text-[10px] text-[#e11d48]'
              >
                <GraduationCap className='mr-1 h-3 w-3' /> Course #
                {selectedGroup.course}
              </Badge>
              <Badge
                variant='outline'
                className='border-none bg-slate-100 text-[10px] text-slate-600'
              >
                <User className='mr-1 h-3 w-3' /> Teacher #
                {selectedGroup.teacher}
              </Badge>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <Card className='h-fit border-none shadow-md'>
            <CardHeader className='p-4 pb-2'>
              <h3 className='text-sm font-bold'>Talaba qo'shish</h3>
            </CardHeader>
            <CardContent className='space-y-3 p-4 pt-0'>
              <Select
                value={selectedStudentUsername}
                onValueChange={setSelectedStudentUsername}
              >
                <SelectTrigger className='h-9 text-xs'>
                  <SelectValue placeholder='Tanlang' />
                </SelectTrigger>
                <SelectContent>
                  {allStudents.map((s) => (
                    <SelectItem key={s.id} value={s.username}>
                      {s.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size='sm'
                className='w-full bg-[#e11d48] hover:bg-[#be123c]'
                disabled={!selectedStudentUsername || addStudentMutation.isPending}
                onClick={() => {
                  toast.promise(
                    addStudentMutation.mutateAsync({
                      username: selectedStudentUsername,
                    }),
                    {
                      loading: "Qo'shilmoqda...",
                      success: () => {
                        setSelectedStudentUsername('')
                        return "Talaba qo'shildi"
                      },
                      error: (err) => getErrorMessage(err),
                    }
                  )
                }}
              >
                <Plus className='mr-1 h-4 w-4' /> Qo'shish
              </Button>
            </CardContent>
          </Card>

          <Card className='border-none shadow-md lg:col-span-2'>
            <div className='flex items-center justify-between border-b bg-slate-50/50 p-4 py-3'>
              <h3 className='flex items-center gap-2 text-sm font-bold'>
                Talabalar ro'yxati
                <Badge className='h-5 bg-[#fb7185] px-1.5 text-[10px]'>
                  {selectedGroup.students?.length ?? 0}
                </Badge>
              </h3>
            </div>
            <div className='divide-y'>
              {!selectedGroup.students?.length ? (
                <div className='p-8 text-center text-xs text-muted-foreground'>
                  Ro'yxat bo'sh
                </div>
              ) : (
                selectedGroup.students.map((s) => (
                  <div
                    key={s.id}
                    className='flex items-center justify-between p-3 px-4 hover:bg-rose-50/20'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-[#e11d48]'>
                        {s.student.toString().slice(-2)}
                      </div>
                      <span className='text-sm font-medium text-slate-700'>
                        ID: {s.student}
                      </span>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-slate-400 hover:text-[#e11d48]'
                      onClick={() =>
                        removeStudentMutation.mutateAsync(s.student)
                      }
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // --- RENDERING: Main Grid ---
  return (
    <div className='container mx-auto max-w-7xl p-4 lg:p-6'>
      <div className='mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <h1 className='text-3xl font-black tracking-tight text-slate-900'>
            Guruhlar
          </h1>
          <p className='text-xs font-medium text-slate-500'>
            Guruhlarni boshqarish va tahrirlash.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className='h-10 rounded-full bg-[#e11d48] px-6 font-bold text-white shadow-md shadow-rose-100 hover:bg-[#be123c]'
        >
          <Plus className='mr-2 h-4 w-4' /> Yangi guruh
        </Button>
      </div>

      <div className='relative mb-6 max-w-sm'>
        <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
        <Input
          placeholder='Qidirish...'
          className='h-10 rounded-xl border-none bg-white pl-10 text-sm shadow-sm focus-visible:ring-[#e11d48]'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className='flex h-40 items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-[#e11d48]' />
        </div>
      ) : isError ? (
        <div className='rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700'>
          Guruhlarni yuklashda xatolik
        </div>
      ) : filtered.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center'>
          <div className='mb-4 rounded-full bg-white p-4 text-slate-400 shadow-sm'>
            <User size={40} />
          </div>
          <h3 className='text-lg font-semibold text-gray-900'>
            Guruhlar topilmadi
          </h3>
          <p className='mt-1 text-sm text-gray-500'>Birinchi guruhni yarating</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {filtered.map((group) => (
            <Card
              key={group.id}
              className='group border-none shadow-md transition-all duration-300 hover:shadow-xl'
            >
              <div className='h-1 w-full rounded-t-xl bg-[#e11d48] opacity-80' />
              <CardHeader className='p-4 pb-2'>
                <div className='mb-1 flex items-start justify-between'>
                  <Badge className='h-5 border-none bg-rose-50 text-[10px] font-bold text-[#e11d48] hover:bg-rose-100'>
                    {group.status || 'Active'}
                  </Badge>
                  <div className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() => {
                        setSelectedGroup(group)
                        setEditOpen(true)
                      }}
                    >
                      <Pencil className='h-3.5 w-3.5' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-rose-500'
                      onClick={() => handleDelete(group.id)}
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>
                <h3 className='truncate text-lg font-bold text-slate-800'>
                  {group.name}
                </h3>
              </CardHeader>
              <CardContent className='space-y-3 p-4 pt-2'>
                <div className='flex justify-between border-b border-slate-50 pb-2 text-xs font-medium'>
                  <span className='text-slate-400'>Talabalar:</span>
                  <span className='font-bold text-slate-900'>
                    {group.students?.length ?? 0}
                  </span>
                </div>
                <div className='grid grid-cols-2 gap-2 text-[10px]'>
                  <div>
                    <p className='font-black text-slate-400 uppercase'>Course</p>
                    <p className='text-xs font-bold text-slate-700'>
                      #{group.course}
                    </p>
                  </div>
                  <div>
                    <p className='font-black text-slate-400 uppercase'>Teacher</p>
                    <p className='text-xs font-bold text-slate-700'>
                      #{group.teacher}
                    </p>
                  </div>
                </div>
                <Button
                  size='sm'
                  className='h-9 w-full rounded-lg bg-slate-900 font-bold text-white hover:bg-slate-800'
                  onClick={() => setSelectedGroup(group)}
                >
                  Boshqarish
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Yaratish dialogi */}
      <GroupFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title='Yangi guruh'
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      {/* Tahrirlash dialogi */}
      {selectedGroup && (
        <GroupFormDialog
          open={editOpen}
          onOpenChange={(v) => {
            setEditOpen(v)
            if (!v) setSelectedGroup(null)
          }}
          title='Tahrirlash'
          initial={{
            name: selectedGroup.name,
            course: String(selectedGroup.course),
            teacher_username:
              selectedGroup.teacher_name?.trim() ?? '',
            start_date: selectedGroup.start_date,
          }}
          onSubmit={handleEdit}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  )
}
