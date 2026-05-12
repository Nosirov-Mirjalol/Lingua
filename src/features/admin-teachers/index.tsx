import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'
import { useDeleteAdminTeacher } from '@/hooks/admin/teachers/useDeleteAdminTeacher'
import { useUpdateAdminTeacher } from '@/hooks/admin/teachers/useUpdateAdminTeacher'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AdminTeacherCreateModal } from '@/features/admin-teachers/components/admin-teacher-create-modal'

export default function AdminTeachersPage() {
  const { data: teachers = [], isLoading, isError } = useAdminTeachers()
  const deleteMutation = useDeleteAdminTeacher()

  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editActive, setEditActive] = useState(true)

  const updateMutation = useUpdateAdminTeacher(editingId ?? 0)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return teachers
    return teachers.filter((t) =>
      t.username?.toLowerCase().includes(q) ||
      t.first_name?.toLowerCase().includes(q) ||
      t.last_name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q)
      )
  }, [teachers, search])

  const submitEdit = () => {
    const trimmedName = editName.trim()
    const trimmedEmail = editEmail.trim()
    const trimmedPhone = editPhone.trim()

    if (!trimmedName) {
      toast.error('Ism kiritilmadi')
      return
    }
    if (!trimmedEmail) {
      toast.error('Email kiritilmadi')
      return
    }

    if (!editingId) return

    const payload = {
      first_name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || undefined,
      is_active: editActive,
    }

    toast.promise(updateMutation.mutateAsync(payload), {
      loading: 'Yangilanilmoqda...',
      success: () => {
        setEditingId(null)
        setEditName('')
        setEditEmail('')
        setEditPhone('')
        setEditActive(true)
        return 'Teacher yangilandi'
      },
      error: (err) => {
        const e = err as { message?: string; data?: unknown }
        const details =
          e?.data && typeof e.data === 'object'
            ? JSON.stringify(e.data)
            : e?.data
              ? String(e.data)
              : ''
        return details ? `${e?.message ?? 'Xato'} | ${details}` : (e?.message ?? 'Xato yuz berdi')
      },
    })
  }

  const startEdit = (teacher: any) => {
    setEditingId(teacher.id)
    setEditName(teacher.first_name || '')
    setEditEmail(teacher.email || '')
    setEditPhone(teacher.phone || '')
    setEditActive(teacher.is_active ?? true)
  }

  const remove = (id: number) => {
    if (!confirm("O'chirishga ishonchingiz komilmi?")) return
    toast.promise(deleteMutation.mutateAsync(id), {
      loading: "O'chirilmoqda...",
      success: "O'chirildi",
      error: 'Xato yuz berdi',
    })
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <div className='container mx-auto max-w-6xl space-y-6 p-4'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-2xl font-black text-slate-900'>Teachers</h1>
            <p className='text-sm font-medium text-slate-500'>
              Admin uchun teacherlar
            </p>
          </div>

          <div className='flex w-full flex-col gap-2 sm:flex-row sm:items-center md:w-auto'>
            <div className='relative w-full md:w-[280px]'>
              <Input
                placeholder='Qidirish...'
                className='h-10 rounded-xl'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              className='h-10 shrink-0 rounded-xl bg-slate-900 font-bold text-white hover:bg-slate-800'
              onClick={() => setCreateOpen(true)}
            >
              <Plus className='mr-2 h-4 w-4' />
              Yangi teacher
            </Button>
          </div>
        </div>

        <AdminTeacherCreateModal
          open={createOpen}
          onOpenChange={setCreateOpen}
        />

        <Dialog
          open={editingId !== null}
          onOpenChange={(v) => {
            if (!v) {
              setEditingId(null)
              setEditName('')
              setEditEmail('')
              setEditPhone('')
              setEditActive(true)
            }
          }}
        >
          <DialogContent className='border-t-4 border-slate-900 sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-lg font-bold text-slate-900'>
                Teacherni tahrirlash
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-2 py-2'>
              <div className='space-y-1'>
                <Label htmlFor='edit-name' className='text-xs font-semibold'>
                  Ism
                </Label>
                <Input
                  id='edit-name'
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className='h-10 rounded-xl'
                  placeholder='Ismi'
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='edit-email' className='text-xs font-semibold'>
                  Email
                </Label>
                <Input
                  id='edit-email'
                  type='email'
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className='h-10 rounded-xl'
                  placeholder='Emaili'
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='edit-phone' className='text-xs font-semibold'>
                  Telefon
                </Label>
                <Input
                  id='edit-phone'
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className='h-10 rounded-xl'
                  placeholder='+998 XX XXX XX XX'
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='edit-active' className='text-xs font-semibold'>
                  Status
                </Label>
                <div className='flex h-10 items-center space-x-2'>
                  <input
                    id='edit-active'
                    type='checkbox'
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className='h-4 w-4'
                  />
                  <Label htmlFor='edit-active' className='text-sm font-medium text-slate-600'>
                    Faol
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter className='gap-2'>
              <Button
                variant='outline'
                type='button'
                className='rounded-xl'
                onClick={() => {
                  setEditingId(null)
                  setEditName('')
                  setEditEmail('')
                  setEditPhone('')
                  setEditActive(true)
                }}
                disabled={updateMutation.isPending}
              >
                Bekor qilish
              </Button>
              <Button
                type='button'
                className='rounded-xl bg-slate-900 font-bold hover:bg-slate-800'
                onClick={submitEdit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Yangilanmoqda...' : 'Saqlash'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className='text-sm text-slate-500'>Yuklanmoqda...</div>
        ) : isError ? (
          <div className='text-sm text-rose-700'>Xatolik</div>
        ) : filtered.length === 0 ? (
          <div className='text-center py-12'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Teacherlar topilmadi
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Birinchi teacherni yarating
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {filtered.map((teacher) => (
              <Card key={teacher.id} className='border-none shadow-md hover:shadow-lg transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='truncate text-lg font-bold text-slate-900'>
                        {teacher.first_name} {teacher.last_name}
                      </h3>
                      <p className='text-sm font-medium text-slate-500'>
                        @{teacher.username} • {teacher.email}
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-9 rounded-xl'
                        onClick={() => startEdit(teacher)}
                      >
                        <Pencil className='mr-2 h-4 w-4' />
                        Tahrirlash
                      </Button>
                      <Button
                        variant='destructive'
                        size='sm'
                        className='h-9 rounded-xl'
                        onClick={() => remove(teacher.id)}
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Ochirish
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='grid grid-cols-2 gap-4 text-[10px]'>
                    <div>
                      <p className='font-black text-slate-400 uppercase'>Status</p>
                      <p className='text-xs font-bold text-slate-700'>
                        {teacher.is_active ? 'Faol' : 'Nofaol'}
                      </p>
                    </div>
                    <div>
                      <p className='font-black text-slate-400 uppercase'>Created</p>
                      <p className='text-xs font-bold text-slate-700'>
                        {teacher.created_at
                          ? new Date(teacher.created_at).toLocaleDateString('uz-UZ')
                          : 'Noma\'lum'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
