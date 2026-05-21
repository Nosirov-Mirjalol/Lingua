import { useMemo, useState } from 'react'
import {
  BarChart3,
  BookOpen,
  Clock,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { useDeleteAdminCourse } from '@/hooks/admin/courses/useDeleteAdminCourse'
import { useUpdateAdminCourse } from '@/hooks/admin/courses/useUpdateAdminCourse'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { ConfigDrawer } from '@/components/config-drawer'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { AdminCourseCreateModal } from '@/features/admin-courses/components/admin-course-create-modal'

export default function AdminCoursesPage() {
  const [search, setSearch] = useState('')
  const { data: courses = [], isLoading } = useAdminCourses(search)
  const deleteMutation = useDeleteAdminCourse()
  const updateMutation = useUpdateAdminCourse()

  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return courses.filter((c) => c.name.toLowerCase().includes(q))
  }, [courses, search])

  const submitEdit = () => {
    if (!editingId) return
    updateMutation
      .mutateAsync({
        id: editingId,
        data: { name: editName.trim() },
      })
      .then(() => {
        setEditingId(null)
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

      <Main className='bg-background font-outfit'>
        <div className='container mx-auto max-w-7xl p-6'>
          <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-foreground'>Kurslar</h1>
              <p className='text-sm text-muted-foreground'>
                O'quv dasturlari ro'yxati
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <div className='relative'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Qidirish...'
                  className='h-10 w-full rounded-lg border bg-muted pl-9 md:w-64'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <RoseButton onClick={() => setCreateOpen(true)}>
                <Plus className='mr-2 h-4 w-4' /> Yangi kurs
              </RoseButton>
            </div>
          </div>

          {isLoading ? (
            <div className='flex h-40 items-center justify-center text-muted-foreground'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {filtered.map((course) => (
                <Card
                  key={course.id}
                  className='overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md'
                >
                  <CardContent className='p-5'>
                    <div className='mb-6 flex items-center gap-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                        <BookOpen className='h-5 w-5' />
                      </div>
                      <div>
                        <h3 className='leading-tight font-bold text-foreground'>
                          {course.name}
                        </h3>
                        <p className='text-[10px] font-bold tracking-tighter text-muted-foreground uppercase'>
                          ID: #{course.id}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center justify-between border-t py-3'>
                      <div className='flex items-center gap-1.5'>
                        <Clock className='h-3.5 w-3.5 text-muted-foreground' />
                        <span className='text-xs font-bold text-muted-foreground'>
                          4 oy
                        </span>
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <BarChart3 className='h-3.5 w-3.5 text-muted-foreground' />
                        <span className='text-xs font-bold text-muted-foreground'>
                          A1-C1
                        </span>
                      </div>
                    </div>

                    <div className='mt-4 flex gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-9 flex-1 rounded-lg border text-xs font-bold'
                        onClick={() => {
                          setEditingId(course.id)
                          setEditName(course.name)
                        }}
                      >
                        <Pencil className='mr-2 h-3.5 w-3.5' />
                        Tahrirlash
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-9 flex-1 rounded-lg border text-xs font-bold text-destructive hover:bg-destructive/10'
                        onClick={() => setDeleteId(course.id)}
                      >
                        <Trash2 className='mr-2 h-3.5 w-3.5' />
                        O'chirish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog
          open={editingId !== null}
          onOpenChange={(v) => !v && setEditingId(null)}
        >
          <DialogContent className='rounded-xl bg-card p-6 sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-lg font-bold text-foreground'>
                Kursni tahrirlash
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-4 py-2'>
              <div className='space-y-1'>
                <Label className='text-xs font-bold text-muted-foreground'>
                  Kurs nomi
                </Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className='h-10 rounded-lg'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='ghost'
                onClick={() => setEditingId(null)}
                className='h-10 rounded-lg'
              >
                Bekor qilish
              </Button>
              <RoseButton
                onClick={submitEdit}
                disabled={updateMutation.isPending}
                className='px-8'
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

        <AdminCourseCreateModal
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      </Main>
    </>
  )
}
