import { useMemo, useState } from 'react'
import { Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminTeacher } from '@/api/service/admin/teacher.service'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'
import { useDeleteAdminTeacher } from '@/hooks/admin/teachers/useDeleteAdminTeacher'
import { useUpdateAdminTeacher } from '@/hooks/admin/teachers/useUpdateAdminTeacher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { RoseButton } from '@/components/ui/rose-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
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
      <AdminHeader fixed>
        <ConfigDrawer />
      </AdminHeader>

      <Main className='bg-background/40'>
        <div className='container mx-auto max-w-7xl p-6'>
          {/* Header & Actions: Qidiruv tizimi va tugma yuqoriga, sodda dizaynda joylashtirildi */}
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

          <Card>
            <CardHeader>
              <CardTitle>O'qituvchilar</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='py-8 text-center text-sm text-muted-foreground'>
                  Yuklanmoqda...
                </div>
              ) : paginated.length === 0 ? (
                <div className='py-8 text-center text-sm text-muted-foreground'>
                  O'qituvchilar topilmadi
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12'></TableHead>
                      <TableHead>F.I.SH</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((t: AdminTeacher) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <Avatar className='h-8 w-8'>
                            <AvatarImage
                              src={
                                t.avatar
                                  ? t.avatar.startsWith('http')
                                    ? t.avatar
                                    : `http://185.190.143.64:8000${t.avatar}`
                                  : undefined
                              }
                            />
                            <AvatarFallback className='bg-muted text-foreground'>
                              {getInitials(t.full_name || '')}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className='font-medium'>
                          {t.full_name || '—'}
                        </TableCell>
                        <TableCell>@{t.username}</TableCell>
                        <TableCell>{t.phone || '-'}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end space-x-1'>
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
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
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Ustozni tahrirlash</DialogTitle>
            </DialogHeader>
            <div className='space-y-4 pt-2'>
              <div className='space-y-2'>
                <Label>To'liq ism</Label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  placeholder='Ism Familiya'
                />
              </div>

              <div className='space-y-2'>
                <Label>Telefon</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label>O'quv maqsadi</Label>
                <Input
                  value={editForm.learning_goal}
                  onChange={(e) =>
                    setEditForm({ ...editForm, learning_goal: e.target.value })
                  }
                  placeholder='Masalan: next.js, react...'
                />
              </div>
            </div>
            <DialogFooter className='mt-6 gap-2'>
              <Button variant='outline' onClick={() => setEditingTeacher(null)}>
                Bekor qilish
              </Button>
              <RoseButton
                onClick={submitEdit}
                disabled={updateMutation.isPending}
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
