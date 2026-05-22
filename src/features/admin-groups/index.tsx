import { useMemo, useState } from 'react'
import { Loader2, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { Group } from '@/api/service/teacher/group.type'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { useAdminGroups } from '@/hooks/admin/groups/useAdminGroups'
import { useDeleteAdminGroup } from '@/hooks/admin/groups/useDeleteAdminGroup'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'
import { Input } from '@/components/ui/input'
import { RoseButton } from '@/components/ui/rose-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { AdminGroupCard } from '@/features/admin-groups/components/admin-group-card'
import { AdminGroupCreateModal } from '@/features/admin-groups/components/admin-group-create-modal'
import { AdminGroupStudentsModal } from '@/features/admin-groups/components/admin-group-students-modal'
import {
  adminInputClass,
  adminPageSubtitleClass,
  adminPageTitleClass,
} from '@/lib/admin-ui'
import { cn } from '@/lib/utils'

interface Teacher {
  id: number
  username: string
  first_name?: string
  last_name?: string
}

export default function AdminGroupsPage() {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [manageGroupId, setManageGroupId] = useState<number | null>(null)

  const { data: groups = [], isLoading } = useAdminGroups()
  const { data: courses = [] } = useAdminCourses('')
  const { data: rawTeachersData } = useAdminTeachers()
  const deleteMutation = useDeleteAdminGroup()

  const teachers = useMemo<Teacher[]>(() => {
    const data: unknown = rawTeachersData
    const list = Array.isArray(data)
      ? data
      : data &&
          typeof data === 'object' &&
          Array.isArray((data as { results?: unknown }).results)
        ? (data as { results: unknown[] }).results
        : []
    return (list as Teacher[]).filter((t) => t.id != null)
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

  const confirmDelete = () => {
    if (!deleteId) return
    toast.promise(deleteMutation.mutateAsync(deleteId), {
      loading: "O'chirilmoqda...",
      success: () => {
        setDeleteId(null)
        return "O'chirildi"
      },
      error: (err: unknown) =>
        (err as Error)?.message || "O'chirishda xatolik",
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
              onClick={() => setCreateOpen(true)}
            >
              <Plus className='mr-2 h-4 w-4' /> Qo&apos;shish
            </RoseButton>
          </header>

          <div className='admin-page__toolbar'>
            <div className='admin-page__search-wrap'>
              <Search className='absolute top-1/2 left-4 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Guruh qidirish...'
                className={cn(
                  adminInputClass,
                  'h-11 border-none bg-muted pl-11 focus-visible:ring-1'
                )}
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
                  onManageStudents={() => setManageGroupId(group.id)}
                  onDelete={() => setDeleteId(group.id)}
                />
              ))
            )}
          </div>
        </div>

        <DeleteConfirmDialog
          open={deleteId !== null}
          onOpenChange={(v) => !v && setDeleteId(null)}
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isPending}
        />

        <AdminGroupCreateModal
          open={createOpen}
          onOpenChange={setCreateOpen}
        />

        <AdminGroupStudentsModal
          groupId={manageGroupId}
          onOpenChange={(open) => !open && setManageGroupId(null)}
        />
      </Main>
    </>
  )
}
