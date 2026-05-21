import { useMemo, useState } from 'react'
import { Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminTeacher } from '@/api/service/admin/teacher.service'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'
import { useDeleteAdminTeacher } from '@/hooks/admin/teachers/useDeleteAdminTeacher'
import { useUpdateAdminTeacher } from '@/hooks/admin/teachers/useUpdateAdminTeacher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoseButton } from '@/components/ui/rose-button'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { ListPagination } from '@/components/list-pagination'
import { AdminTeacherCreateModal } from '@/features/admin-teachers/components/admin-teacher-create-modal'

/** full_name dan avatar uchun bosh harf(lar) olish */
function getInitials(fullName: string): string {
  if (!fullName) return '?'
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return ((parts[0][0] ?? '') + (parts[1][0] ?? '')).toUpperCase()
}

export default function AdminTeachersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<AdminTeacher | null>(
    null
  )
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    learning_goal: '',
  })

  const { data: rawTeachers = [], isLoading } = useAdminTeachers()
  const deleteMutation = useDeleteAdminTeacher()
  const updateMutation = useUpdateAdminTeacher()

  const teachers = useMemo(
    () => (Array.isArray(rawTeachers) ? rawTeachers : []),
    [rawTeachers]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return teachers.filter(
      (t: AdminTeacher) =>
        (t.full_name || '').toLowerCase().includes(q) ||
        (t.username || '').toLowerCase().includes(q)
    )
  }, [teachers, search])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const startEdit = (teacher: AdminTeacher) => {
    setEditingTeacher(teacher)
    setEditForm({
      full_name: teacher.full_name || '',
      phone: teacher.phone || '',
      learning_goal: teacher.learning_goal || '',
    })
  }

  const submitEdit = () => {
    if (!editingTeacher) return
    updateMutation
      .mutateAsync({
        id: editingTeacher.id,
        data: {
          full_name: editForm.full_name,
          phone: editForm.phone,
          learning_goal: editForm.learning_goal,
        },
      })
      .then(() => {
        setEditingTeacher(null)
        toast.success('Yangilandi')
      })
  }

  const confirmDelete = () => {
    if (!deleteId) return
    deleteMutation.mutateAsync(deleteId).then(() => {
      setDeleteId(null)
      toast.success("O'chirildi")
    })
  }

  return (
    <>
      <AdminHeader fixed />

      <Main className='bg-background/40'>
        <div className='container mx-auto max-w-7xl p-6'>
          <div className='mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between'>
            <div>
              <p className='mb-1 text-xs font-black tracking-widest text-primary uppercase'>
                Ustozlar boshqaruvi
              </p>
              <h1 className='text-3xl font-bold text-foreground'>
                O'qituvchilar
              </h1>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              <div className='relative'>
                <Search className='absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Qidirish...'
                  className='h-10 w-full rounded-full bg-background pl-11 text-sm shadow-sm sm:w-72'
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </div>
              <RoseButton
                onClick={() => setCreateOpen(true)}
                className='h-10 rounded-full px-6 shadow-sm'
              >
                <Plus className='mr-2 h-4 w-4' /> Qo'shish
              </RoseButton>
            </div>
          </div>

          <Card className='border-border shadow-md'>
            <div className='overflow-x-auto'>
              <table className='w-full text-left'>
                <thead>
                  <tr className='border-b bg-muted/20'>
                    {/* Guruhlar olib tashlandi */}
                    {['F.I.SH', 'Telefon', 'Maqsad', ''].map((h) => (
                      <th
                        key={h}
                        className='px-6 py-4 text-xs font-bold tracking-wider text-muted-foreground uppercase'
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/50'>
                  {isLoading ? (
                    <tr>
                      {/* colSpan 5 dan 4 ga o'zgardi */}
                      <td colSpan={4} className='p-10 text-center'>
                        <Loader2 className='inline-block animate-spin text-muted-foreground' />
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className='p-10 text-center text-sm text-muted-foreground'
                      >
                        Ustozlar topilmadi
                      </td>
                    </tr>
                  ) : (
                    paginated.map((t: AdminTeacher) => (
                      <tr
                        key={t.id}
                        className='group border-b border-border/50 transition-colors hover:bg-muted/30'
                      >
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-10 w-10 border border-border/50'>
                              <AvatarImage src={t.avatar || undefined} />
                              <AvatarFallback className='bg-primary/5 text-primary'>
                                {getInitials(t.full_name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='text-sm font-semibold text-foreground'>
                                {t.full_name || '—'}
                              </div>
                              <div className='mt-0.5 text-xs text-muted-foreground'>
                                @{t.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className='px-6 py-4 text-sm font-medium text-muted-foreground'>
                          {t.phone || '—'}
                        </td>

                        <td className='max-w-48 truncate px-6 py-4 text-sm text-muted-foreground'>
                          {t.learning_goal || '—'}
                        </td>

                        <td className='px-6 py-4 text-right'>
                          <div className='flex justify-end gap-1'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => startEdit(t)}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => setDeleteId(t.id)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <ListPagination
            page={page}
            pageSize={pageSize}
            totalCount={teachers.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            className='mt-4 px-1'
          />
        </div>

        <Dialog
          open={editingTeacher !== null}
          onOpenChange={(v) => !v && setEditingTeacher(null)}
        >
          <DialogContent className='rounded-2xl sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-xl font-bold'>
                Ustozni tahrirlash
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-4 pt-2'>
              <div className='flex items-center gap-4 border-b pb-4'>
                <Avatar className='h-16 w-16 border-2 border-primary/20'>
                  <AvatarImage src={editingTeacher?.avatar || undefined} />
                  <AvatarFallback className='bg-primary/10 text-lg font-bold text-primary'>
                    {getInitials(editForm.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-sm font-semibold text-foreground'>
                    {editingTeacher?.username}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    ID: #{editingTeacher?.id}
                  </p>
                </div>
              </div>

              <div className='space-y-2'>
                <Label className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                  To'liq ism
                </Label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  placeholder='Ism Familiya'
                  className='rounded-xl'
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                  Telefon
                </Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder='+998 90 123 45 67'
                  className='rounded-xl'
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                  O'quv maqsadi
                </Label>
                <Input
                  value={editForm.learning_goal}
                  onChange={(e) =>
                    setEditForm({ ...editForm, learning_goal: e.target.value })
                  }
                  placeholder='Masalan: next.js, react...'
                  className='rounded-xl'
                />
              </div>
            </div>
            <DialogFooter className='mt-6 gap-2'>
              <Button
                variant='outline'
                onClick={() => setEditingTeacher(null)}
                className='rounded-xl'
              >
                Bekor qilish
              </Button>
              <RoseButton
                onClick={submitEdit}
                disabled={updateMutation.isPending}
                className='rounded-xl'
              >
                {updateMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  'Saqlash'
                )}
              </RoseButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DeleteConfirmDialog
          open={deleteId !== null}
          onOpenChange={(v) => !v && setDeleteId(null)}
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isPending}
        />

        <AdminTeacherCreateModal
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      </Main>
    </>
  )
}
