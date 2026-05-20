import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminTeacher } from '@/api/service/admin/teacher.service'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'
import { useDeleteAdminTeacher } from '@/hooks/admin/teachers/useDeleteAdminTeacher'
import { useUpdateAdminTeacher } from '@/hooks/admin/teachers/useUpdateAdminTeacher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoseButton } from '@/components/ui/rose-button'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { ListPagination } from '@/components/list-pagination'
import { AdminTeacherCreateModal } from '@/features/admin-teachers/components/admin-teacher-create-modal'
import type { Group } from '@/api/service/teacher/group.type'
import { useAdminGroups } from '@/hooks/admin/groups/useAdminGroups'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { useDeleteAdminGroup } from '@/hooks/admin/groups/useDeleteAdminGroup'
import { TeacherGroupModal } from '@/features/admin-teachers/components/teacher-group-modal'
import { TeacherGroupsManageModal } from '@/features/admin-teachers/components/teacher-groups-manage-modal'

/** full_name dan avatar uchun bosh harf(lar) olish */
function getInitials(fullName: string): string {
  if (!fullName) return '?'
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return ((parts[0][0] ?? '') + (parts[1][0] ?? '')).toUpperCase()
}

export default function AdminTeachersPage() {
  const { data: rawTeachers = [], isLoading } = useAdminTeachers()
  const deleteMutation = useDeleteAdminTeacher()
  const updateMutation = useUpdateAdminTeacher()

  const { data: groups = [] } = useAdminGroups()
  const { data: courses = [] } = useAdminCourses('')
  const deleteGroupMutation = useDeleteAdminGroup()

  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [selectedTeacherForGroup, setSelectedTeacherForGroup] = useState<AdminTeacher | null>(null)
  const [groupsManageModalOpen, setGroupsManageModalOpen] = useState(false)
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null)


  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<AdminTeacher | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    learning_goal: '',
  })

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

  const getTeacherGroups = (teacherId: number) => {
    const teacherGroups = Array.isArray(groups) ? groups.filter((g: Group) => g.teacher === teacherId) : []
    return teacherGroups
  }

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
    toast.promise(
      updateMutation.mutateAsync({
        id: editingTeacher.id,
        data: {
          full_name: editForm.full_name,
          phone: editForm.phone,
          learning_goal: editForm.learning_goal,
        },
      }),
      {
        loading: 'Yangilanmoqda...',
        success: () => { setEditingTeacher(null); return 'Yangilandi' },
        error: 'Xatolik yuz berdi',
      }
    )
  }

  const confirmDelete = () => {
    if (!deleteId) return
    toast.promise(deleteMutation.mutateAsync(deleteId), {
      loading: "O'chirilmoqda...",
      success: () => { setDeleteId(null); return "O'chirildi" },
      error: 'Xatolik yuz berdi',
    })
  }

  const confirmDeleteGroup = () => {
    if (!deleteGroupId) return
    toast.promise(deleteGroupMutation.mutateAsync(deleteGroupId), {
      loading: "O'chirilmoqda...",
      success: () => {
        setDeleteGroupId(null)
        return "O'chirildi"
      },
      error: 'Xatolik yuz berdi',
    })
  }

  return (
    <>
      <AdminHeader fixed />

<<<<<<< HEAD
      <Main className='bg-background font-outfit'>
        <div className='container mx-auto max-w-[1400px] p-6'>
          <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
=======
      <Main fixed className='bg-background/40'>
        <div className='container mx-auto max-w-7xl p-6'>
          
          {/* Header & Actions: Qidiruv tizimi va tugma yuqoriga, sodda dizaynda joylashtirildi */}
          <div className='mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between'>
>>>>>>> f625b1e03f99fb0e9fc0ac9a0f170c64aebab351
            <div>
              <p className='mb-1 text-xs font-black tracking-widest text-primary uppercase'>
                Ustozlar boshqaruvi
              </p>
              <h1 className='text-3xl font-bold text-foreground'>O'qituvchilar</h1>
            </div>
            
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              <div className='relative'>
                <Search className='absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Qidirish...'
                  className='h-10 w-full rounded-full bg-background pl-11 text-sm shadow-sm sm:w-72'
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <RoseButton onClick={() => setCreateOpen(true)} className='h-10 rounded-full px-6 shadow-sm'>
                <Plus className='mr-2 h-4 w-4' /> Qo'shish
              </RoseButton>
            </div>
          </div>

<<<<<<< HEAD
          <Card className='rounded-[32px] border-none bg-background shadow-sm'>
            <div className='flex flex-col gap-4 border-b border-slate-50 p-6 md:flex-row md:items-center md:justify-between'>
              <div className='flex w-fit items-center gap-1 rounded-full bg-muted p-1'>
                {['Hammasi', 'Faol', 'Nofaol'].map((tab) => (
                  <button
                    key={tab}
                    className={cn(
                      'rounded-full px-6 py-2 text-xs font-bold transition-all',
                      tab === 'Hammasi'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-200 dark:shadow-none'
                        : 'text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className='flex items-center gap-3'>
                <div className='relative'>
                  <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
                  <Input
                    placeholder='Ustozlarni qidirish...'
                    className='h-10 w-64 rounded-full border-none bg-muted pl-10 text-xs font-medium'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-full text-slate-400'
                >
                  <Filter className='h-4 w-4' />
                </Button>
              </div>
            </div>

=======
          <Card className='overflow-hidden border-muted shadow-sm'>
>>>>>>> f625b1e03f99fb0e9fc0ac9a0f170c64aebab351
            <div className='overflow-x-auto'>
              <table className='w-full text-left'>
                <thead>
                  <tr className='border-b bg-muted/20'>
                    {/* Guruhlar olib tashlandi */}
                    {['F.I.SH', 'Telefon', 'Maqsad', ''].map((h) => (
                      <th key={h} className='px-6 py-4 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
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
                      <td colSpan={4} className='p-10 text-center text-sm text-muted-foreground'>
                        Ustozlar topilmadi
                      </td>
                    </tr>
                  ) : (
                    paginated.map((t: AdminTeacher) => (
                      <tr key={t.id} className='group transition-colors hover:bg-muted/30'>
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
                              <div className='text-xs text-muted-foreground mt-0.5'>@{t.username}</div>
                            </div>
                          </div>
                        </td>

                        <td className='px-6 py-4 text-sm text-muted-foreground font-medium'>
                          {t.phone || '—'}
                        </td>

                        <td className='px-6 py-4 text-sm text-muted-foreground max-w-48 truncate'>
                          {t.learning_goal || '—'}
                        </td>

                        <td className='px-6 py-4 text-right'>
                          <div className='flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-muted-foreground hover:text-foreground'
                              onClick={() => startEdit(t)}
                              aria-label='Edit'
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                              onClick={() => setDeleteId(t.id)}
                              aria-label='Delete'
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
            totalCount={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
            className='mt-4 px-1'
          />
        </div>

        <Dialog open={editingTeacher !== null} onOpenChange={(v) => !v && setEditingTeacher(null)}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Ustozni tahrirlash</DialogTitle>
            </DialogHeader>
            <div className='space-y-4 pt-2'>
              <div className='space-y-2'>
                <Label>To'liq ism</Label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder='Ism Familiya'
                />
              </div>

              <div className='space-y-2'>
                <Label>Telefon</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div className='space-y-2'>
                <Label>O'quv maqsadi</Label>
                <Input
                  value={editForm.learning_goal}
                  onChange={(e) => setEditForm({ ...editForm, learning_goal: e.target.value })}
                  placeholder='Masalan: next.js, react...'
                />
              </div>
            </div>
            <DialogFooter className='mt-6 gap-2'>
              <Button variant='outline' onClick={() => setEditingTeacher(null)}>
                Bekor qilish
              </Button>
              <RoseButton onClick={submitEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending
                  ? <Loader2 className='h-4 w-4 animate-spin' />
                  : 'Saqlash'
                }
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

<<<<<<< HEAD
        <AdminTeacherCreateModal
          open={createOpen}
          onOpenChange={setCreateOpen}
        />

        <TeacherGroupModal
          isOpen={groupModalOpen}
          onClose={() => {
            setGroupModalOpen(false)
            setSelectedTeacherForGroup(null)
          }}
          teacherId={selectedTeacherForGroup?.id || 0}
          teacherName={selectedTeacherForGroup ? selectedTeacherForGroup.first_name + " " + selectedTeacherForGroup.last_name : ""}
          courses={courses}
        />

        <TeacherGroupsManageModal
          isOpen={groupsManageModalOpen}
          onClose={() => {
            setGroupsManageModalOpen(false)
            setSelectedTeacherForGroup(null)
          }}
          teacherName={selectedTeacherForGroup ? selectedTeacherForGroup.first_name + " " + selectedTeacherForGroup.last_name : ""}
          groups={selectedTeacherForGroup ? getTeacherGroups(selectedTeacherForGroup.id) : []}
          onAddGroup={() => {
            setGroupsManageModalOpen(false)
            setGroupModalOpen(true)
          }}
          onDeleteGroup={setDeleteGroupId}
        />

        <DeleteConfirmDialog
          open={deleteGroupId !== null}
          onOpenChange={(v) => !v && setDeleteGroupId(null)}
          onConfirm={confirmDeleteGroup}
          isLoading={deleteGroupMutation.isPending}
        />
=======
        <AdminTeacherCreateModal open={createOpen} onOpenChange={setCreateOpen} />
>>>>>>> f625b1e03f99fb0e9fc0ac9a0f170c64aebab351
      </Main>
    </>
  )
}