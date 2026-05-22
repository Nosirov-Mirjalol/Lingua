import { useMemo, useState } from 'react'
import { Loader2, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminTeacher } from '@/api/service/admin/teacher.service'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'
import { useDeleteAdminTeacher } from '@/hooks/admin/teachers/useDeleteAdminTeacher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RoseButton } from '@/components/ui/rose-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { ListPagination } from '@/components/list-pagination'
import { AdminTeacherCreateModal } from '@/features/admin-teachers/components/admin-teacher-create-modal'
import {
  adminInputClass,
  adminPageSubtitleClass,
  adminPageTitleClass,
} from '@/lib/admin-ui'
import { cn } from '@/lib/utils'

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
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: teachers = [], isLoading, isError } = useAdminTeachers()
  const deleteMutation = useDeleteAdminTeacher()

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

      <Main className='admin-page bg-background/40'>
        <div className='admin-page__container max-w-7xl'>
          <header className='admin-page__header md:items-end'>
            <div>
              <p className={cn(adminPageSubtitleClass, 'mb-1 text-primary')}>
                Ustozlar boshqaruvi
              </p>
              <h1 className={adminPageTitleClass}>O&apos;qituvchilar</h1>
            </div>

            <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center'>
              <div className='admin-page__search-wrap relative sm:w-72'>
                <Search className='absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Qidirish...'
                  className={cn(
                    adminInputClass,
                    'h-10 border bg-background pl-11 shadow-sm'
                  )}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </div>
              <RoseButton
                onClick={() => setCreateOpen(true)}
                className='admin-page__cta h-10 px-6 shadow-sm'
              >
                <Plus className='mr-2 h-4 w-4' /> Qo'shish
              </RoseButton>
            </div>
          </header>

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
                      <td colSpan={4} className='p-10 text-center'>
                        <Loader2 className='inline-block animate-spin text-muted-foreground' />
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td
                        colSpan={4}
                        className='p-10 text-center text-sm text-destructive'
                      >
                        Ma&apos;lumotlarni yuklashda xatolik. Qayta urinib
                        ko&apos;ring.
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
            totalCount={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            className='mt-4 px-1'
          />
        </div>

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
