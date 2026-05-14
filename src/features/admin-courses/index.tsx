import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { useDeleteAdminCourse } from '@/hooks/admin/courses/useDeleteAdminCourse'
import { useUpdateAdminCourse } from '@/hooks/admin/courses/useUpdateAdminCourse'
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
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { AdminCourseCreateModal } from '@/features/admin-courses/components/admin-course-create-modal'

export default function AdminCoursesPage() {
  const [search, setSearch] = useState('')
  const { data: courses = [], isLoading, isError } = useAdminCourses(search)
  const deleteMutation = useDeleteAdminCourse()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const updateMutation = useUpdateAdminCourse(editingId ?? 0)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((c) => c.name.toLowerCase().includes(q))
  }, [courses, search])

  const submitEdit = () => {
    const trimmed = editName.trim()
    if (!trimmed) {
      toast.error('Kurs nomi kiritilmadi')
      return
    }
    if (!editingId) return

    toast.promise(updateMutation.mutateAsync({ name: trimmed }), {
      loading: 'Yangilanilmoqda...',
      success: () => {
        setEditingId(null)
        setEditName('')
        return 'Kurs yangilandi'
      },
      error: (err) => {
        const e = err as { message?: string; data?: unknown }
        const details =
          e?.data && typeof e.data === 'object'
            ? JSON.stringify(e.data)
            : e?.data
              ? String(e.data)
              : ''
        return details
          ? `${e?.message ?? 'Xato'} | ${details}`
          : (e?.message ?? 'Xato yuz berdi')
      },
    })
  }

  const startEdit = (id: number, courseName: string) => {
    setEditingId(id)
    setEditName(courseName)
  }

  const remove = (id: number) => {
    if (!confirm('Ochirishga ishonchingiz komilmi?')) return
    toast.promise(deleteMutation.mutateAsync(id), {
      loading: 'Ochirilmoqda...',
      success: 'Ochirildi',
      error: (err) => {
        const e = err as { message?: string; data?: unknown }
        const details =
          e?.data && typeof e.data === 'object'
            ? JSON.stringify(e.data)
            : e?.data
              ? String(e.data)
              : ''
        return details
          ? `${e?.message ?? 'Xato'} | ${details}`
          : (e?.message ?? 'Xato yuz berdi')
      },
    })
  }

  return (
    <>
      <Header />
      <div className='container mx-auto max-w-6xl space-y-6 p-4'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-2xl font-black text-slate-900'>Courses</h1>
            <p className='text-sm font-medium text-slate-500'>
              Admin uchun kurslar
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
              Yangi kurs
            </Button>
          </div>
        </div>

        <AdminCourseCreateModal
          open={createOpen}
          onOpenChange={setCreateOpen}
        />

        <Dialog
          open={editingId !== null}
          onOpenChange={(v) => {
            if (!v) {
              setEditingId(null)
              setEditName('')
            }
          }}
        >
          <DialogContent className='border-t-4 border-slate-900 sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-lg font-bold text-slate-900'>
                Kursni tahrirlash
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-2 py-2'>
              <Label
                htmlFor='edit-course-name'
                className='text-xs font-semibold'
              >
                Kurs nomi
              </Label>
              <Input
                id='edit-course-name'
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className='h-10 rounded-xl'
                placeholder='Kurs nomi'
              />
            </div>
            <DialogFooter className='gap-2'>
              <Button
                variant='outline'
                type='button'
                className='rounded-xl'
                onClick={() => {
                  setEditingId(null)
                  setEditName('')
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
                Saqlash
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className='text-sm text-slate-500'>Yuklanmoqda...</div>
        ) : isError ? (
          <div className='text-sm text-rose-700'>Xatolik</div>
        ) : filtered.length === 0 ? (
          <div className='py-12 text-center'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Kurslar topilmadi
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Birinchi kursni yarating
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {filtered.map((c) => (
              <Card
                key={c.id}
                className='border-none shadow-md transition-shadow hover:shadow-lg'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='truncate text-lg font-bold text-slate-900'>
                        {c.name}
                      </h3>
                      <p className='text-sm font-medium text-slate-500'>
                        ID: #{c.id}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-9 flex-1 rounded-xl'
                      onClick={() => startEdit(c.id, c.name)}
                    >
                      <Pencil className='mr-2 h-4 w-4' />
                      Tahrirlash
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      className='h-9 flex-1 rounded-xl'
                      onClick={() => remove(c.id)}
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Ochirish
                    </Button>
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
