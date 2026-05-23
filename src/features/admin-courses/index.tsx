import { useMemo, useState } from 'react'
import {
  BarChart3,
  BookOpen,
  Clock,
  Loader2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  resolveCourseImageUrl,
  type AdminCourseLevel,
} from '@/api/service/admin/course.service'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { useDeleteAdminCourse } from '@/hooks/admin/courses/useDeleteAdminCourse'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RoseButton } from '@/components/ui/rose-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { AdminCourseCreateModal } from '@/features/admin-courses/components/admin-course-create-modal'
import {
  adminInputClass,
  adminPageSubtitleClass,
  adminPageTitleClass,
} from '@/lib/admin-ui'
import { cn } from '@/lib/utils'

const LEVEL_LABELS: Record<AdminCourseLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export default function AdminCoursesPage() {
  const [search, setSearch] = useState('')
  const { data: courses = [], isLoading, isError } = useAdminCourses(search)
  const deleteMutation = useDeleteAdminCourse()

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return courses.filter((c) => c.name.toLowerCase().includes(q))
  }, [courses, search])

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
        <div className='admin-page__container max-w-7xl'>
          <header className='admin-page__header'>
            <div>
              <h1 className={adminPageTitleClass}>Kurslar</h1>
              <p className={adminPageSubtitleClass}>
                O&apos;quv dasturlari ro&apos;yxati
              </p>
            </div>
            <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center'>
              <div className='admin-page__search-wrap relative md:w-64'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Qidirish...'
                  className={cn(adminInputClass, 'h-10 border bg-muted pl-9')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <RoseButton
                className='admin-page__cta shrink-0'
                onClick={() => setCreateOpen(true)}
              >
                <Plus className='mr-2 h-4 w-4' /> Yangi kurs
              </RoseButton>
            </div>
          </header>

          {isLoading ? (
            <div className='flex h-40 items-center justify-center text-muted-foreground'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          ) : isError ? (
            <div className='flex h-40 items-center justify-center text-sm text-destructive'>
              Kurslarni yuklashda xatolik. Qayta urinib ko&apos;ring.
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {filtered.map((course) => {
                const imageUrl = resolveCourseImageUrl(course)
                const durationLabel =
                  course.duration_months != null
                    ? `${course.duration_months} oy`
                    : '—'
                const levelLabel = course.level
                  ? LEVEL_LABELS[course.level] ?? course.level
                  : '—'

                return (
                  <Card
                    key={course.id}
                    className='overflow-hidden rounded-xl border bg-card p-0 shadow-sm transition-all hover:shadow-md'
                  >
                    <div className='relative aspect-[16/10] w-full bg-muted'>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={course.name}
                          className='h-full w-full object-cover'
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className='flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground'>
                          <BookOpen className='h-10 w-10 opacity-40' />
                          <span className='text-xs font-medium'>Rasm yo&apos;q</span>
                        </div>
                      )}
                    </div>

                    <CardContent className='p-4'>
                      <h3 className='line-clamp-2 leading-tight font-bold text-foreground'>
                        {course.name}
                      </h3>
                      <p className='admin-text-caption mt-1 text-muted-foreground'>
                        ID: #{course.id}
                      </p>

                      <div className='mt-4 flex items-center justify-between border-t pt-3'>
                        <div className='flex items-center gap-1.5'>
                          <Clock className='h-3.5 w-3.5 text-muted-foreground' />
                          <span className='text-xs font-bold text-muted-foreground'>
                            {durationLabel}
                          </span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <BarChart3 className='h-3.5 w-3.5 text-muted-foreground' />
                          <span className='text-xs font-bold text-muted-foreground'>
                            {levelLabel}
                          </span>
                        </div>
                      </div>

                      <div className='mt-3'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-9 w-full border text-destructive hover:bg-destructive/10'
                          onClick={() => setDeleteId(course.id)}
                        >
                          <Trash2 className='mr-2 h-3.5 w-3.5' />
                          O&apos;chirish
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

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
