import { useMemo, useState } from 'react'
import {
  Pencil,
  Plus,
  Trash2,
  Search,
  Loader2,
  Filter,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'
import type { AdminTeacher } from '@/api/service/admin/teacher.service'
import { cn } from '@/lib/utils'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'
import { useDeleteAdminTeacher } from '@/hooks/admin/teachers/useDeleteAdminTeacher'
import { useUpdateAdminTeacher } from '@/hooks/admin/teachers/useUpdateAdminTeacher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { Group } from '@/api/service/teacher/group.type'
import { useAdminGroups } from '@/hooks/admin/groups/useAdminGroups'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { useDeleteAdminGroup } from '@/hooks/admin/groups/useDeleteAdminGroup'
import { TeacherGroupModal } from '@/features/admin-teachers/components/teacher-group-modal'
import { TeacherGroupsManageModal } from '@/features/admin-teachers/components/teacher-groups-manage-modal'

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
  const [editingTeacher, setEditingTeacher] = useState<AdminTeacher | null>(
    null
  )
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    active: true,
  })

  const teachers = useMemo(() => {
    if (Array.isArray(rawTeachers)) return rawTeachers
    if (rawTeachers && typeof rawTeachers === 'object') return []
    return []
  }, [rawTeachers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return teachers.filter(
      (t: AdminTeacher) =>
        (t.first_name || '').toLowerCase().includes(q) ||
        (t.last_name || '').toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q)
    )
  }, [teachers, search])

  const paginatedTeachers = useMemo(() => {
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
      first_name: teacher.first_name || '',
      last_name: teacher.last_name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      active: teacher.is_active ?? true,
    })
  }

  const submitEdit = () => {
    if (!editingTeacher) return
    toast.promise(
      updateMutation.mutateAsync({
        id: editingTeacher.id,
        data: {
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          email: editForm.email,
          phone: editForm.phone,
          is_active: editForm.active,
        },
      }),
      {
        loading: 'Yangilanmoqda...',
        success: () => {
          setEditingTeacher(null)
          return 'Yangilandi'
        },
        error: 'Xatolik yuz berdi',
      }
    )
  }

  const confirmDelete = () => {
    if (!deleteId) return
    toast.promise(deleteMutation.mutateAsync(deleteId), {
      loading: "O'chirilmoqda...",
      success: () => {
        setDeleteId(null)
        return "O'chirildi"
      },
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

      <Main className='bg-background font-outfit'>
        <div className='container mx-auto max-w-[1400px] p-6'>
          <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
            <div>
              <p className='mb-1 text-[10px] font-black tracking-widest text-primary uppercase'>
                Ustozlar boshqaruvi
              </p>
              <h1 className='text-3xl font-bold text-foreground'>
                O'qituvchilar (Teachers)
              </h1>
            </div>
            <RoseButton
              onClick={() => setCreateOpen(true)}
              className='rounded-full px-8'
            >
              <Plus className='mr-2 h-4 w-4' /> Ustoz qo'shish
            </RoseButton>
          </div>

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

            <div className='overflow-x-auto'>
              <table className='w-full text-left'>
                <thead>
                  <tr className='border-b bg-muted/30'>
                    <th className='px-6 py-4 text-[10px] font-black tracking-wider text-muted-foreground uppercase'>
                      F.I.SH
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black tracking-wider text-muted-foreground uppercase'>
                      Email
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black tracking-wider text-muted-foreground uppercase'>
                      Telefon
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black tracking-wider text-muted-foreground uppercase'>
                      Guruhlar
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black tracking-wider text-muted-foreground uppercase'>
                      Reyting
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black tracking-wider text-muted-foreground uppercase'>
                      Status
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black tracking-wider text-muted-foreground uppercase'></th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className='p-10 text-center'>
                        <Loader2 className='inline-block animate-spin text-muted-foreground' />
                      </td>
                    </tr>
                  ) : paginatedTeachers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className='p-10 text-center text-xs font-bold text-muted-foreground'
                      >
                        Ustozlar topilmadi
                      </td>
                    </tr>
                  ) : (
                    paginatedTeachers.map((t: AdminTeacher) => (
                      <tr
                        key={t.id}
                        className='group transition-colors hover:bg-muted/50'
                      >
                        <td className='px-6 py-5'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-9 w-9 border-2 border-background shadow-sm'>
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.username}`}
                              />
                              <AvatarFallback>
                                {t.first_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='text-sm font-bold text-foreground'>
                                {t.first_name} {t.last_name}
                              </div>
                              <div className='text-[10px] font-bold text-muted-foreground uppercase'>
                                @{t.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-5 text-sm font-medium text-muted-foreground'>
                          {t.email}
                        </td>
                        <td className='px-6 py-5 text-sm font-medium text-muted-foreground'>
                          {t.phone || '—'}
                        </td>
                        <td className='px-6 py-5'>
                          <Badge
                            variant='secondary'
                            className='h-6 rounded-md border-none bg-muted px-2 text-[10px] font-bold text-muted-foreground'
                          >
                            0ta guruh
                          </Badge>
                        </td>
                        <td className='px-6 py-5'>
                          <div className='flex items-center gap-1 text-primary'>
                            <Star className='h-3 w-3 fill-current' />
                            <span className='text-xs font-black'>4.8</span>
                          </div>
                        </td>
                        <td className='px-6 py-5'>
                          <Badge
                            className={cn(
                              'h-5 rounded-md border-none px-2 text-[9px] font-black',
                              t.is_active
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {t.is_active ? 'FAOL' : 'NOFAOL'}
                          </Badge>
                        </td>
                        <td className='px-6 py-5 text-right'>
                          <div className='flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 rounded-full'
                              onClick={() => startEdit(t)}
                            >
                              <Pencil className='h-3.5 w-3.5' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 rounded-full text-destructive hover:bg-destructive/10'
                              onClick={() => setDeleteId(t.id)}
                            >
                              <Trash2 className='h-3.5 w-3.5' />
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
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize)
              setPage(1)
            }}
            className='px-1'
          />
        </div>

        {/* Improved Edit Modal */}
        <Dialog
          open={editingTeacher !== null}
          onOpenChange={(v) => !v && setEditingTeacher(null)}
        >
          <DialogContent className='rounded-[32px] border-none bg-card p-8 shadow-2xl sm:max-w-[420px]'>
            <DialogHeader className='mb-6'>
              <DialogTitle className='text-2xl font-bold text-foreground'>
                Ustozni tahrirlash
              </DialogTitle>
              <p className='text-sm font-medium text-muted-foreground'>
                O'qituvchi ma'lumotlarini yangilang.
              </p>
            </DialogHeader>
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-[10px] font-black tracking-widest text-muted-foreground uppercase'>
                    Ism
                  </Label>
                  <Input
                    value={editForm.first_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, first_name: e.target.value })
                    }
                    className='h-12 rounded-2xl border-none bg-muted px-4 font-bold'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-[10px] font-black tracking-widest text-muted-foreground uppercase'>
                    Familiya
                  </Label>
                  <Input
                    value={editForm.last_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, last_name: e.target.value })
                    }
                    className='h-12 rounded-2xl border-none bg-muted px-4 font-bold'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label className='text-[10px] font-black tracking-widest text-muted-foreground uppercase'>
                  Email
                </Label>
                <Input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className='h-12 rounded-2xl border-none bg-muted px-4 font-bold'
                />
              </div>
              <div className='flex items-center justify-between rounded-2xl bg-muted p-4'>
                <span className='text-xs font-bold text-muted-foreground'>
                  Status: {editForm.active ? 'Faol' : 'Nofaol'}
                </span>
                <Checkbox
                  checked={editForm.active}
                  onCheckedChange={(v) =>
                    setEditForm({ ...editForm, active: v as boolean })
                  }
                />
              </div>
            </div>
            <DialogFooter className='mt-8 gap-3 sm:gap-0'>
              <Button
                variant='ghost'
                onClick={() => setEditingTeacher(null)}
                className='h-12 flex-1 rounded-full font-bold text-muted-foreground hover:bg-muted'
              >
                Bekor qilish
              </Button>
              <RoseButton
                onClick={submitEdit}
                disabled={updateMutation.isPending}
                className='h-12 flex-[2] rounded-full'
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
      </Main>
    </>
  )
}
