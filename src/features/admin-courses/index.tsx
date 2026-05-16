import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, BookOpen, Clock, BarChart3, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { useDeleteAdminCourse } from '@/hooks/admin/courses/useDeleteAdminCourse'
import { useUpdateAdminCourse } from '@/hooks/admin/courses/useUpdateAdminCourse'
import { Button } from '@/components/ui/button'
import { RoseButton } from '@/components/ui/rose-button'
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
import { ConfigDrawer } from '@/components/config-drawer'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { AdminCourseCreateModal } from '@/features/admin-courses/components/admin-course-create-modal'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'

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
    toast.promise(updateMutation.mutateAsync({ 
      id: editingId, 
      data: { name: editName.trim() } 
    }), {
      loading: 'Yangilanmoqda...',
      success: () => { setEditingId(null); return 'Yangilandi' },
      error: 'Xato',
    })
  }

  const confirmDelete = () => {
    if (!deleteId) return
    toast.promise(deleteMutation.mutateAsync(deleteId), {
      loading: 'O\'chirilmoqda...',
      success: () => { setDeleteId(null); return 'O\'chirildi' },
      error: 'Xatolik yuz berdi'
    })
  }

  return (
    <>
      <AdminHeader fixed>
        <div className='ms-auto flex items-center space-x-2'>
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </AdminHeader>

      <Main fixed className="bg-white font-outfit">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kurslar</h1>
              <p className="text-sm text-slate-500">O'quv dasturlari ro'yxati</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Qidirish..."
                  className="h-10 w-full rounded-lg border-slate-200 bg-slate-50 pl-9 md:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <RoseButton onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Yangi kurs
              </RoseButton>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-slate-200"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((course) => (
                <Card key={course.id} className="border border-slate-100 shadow-sm hover:shadow-md rounded-xl transition-all overflow-hidden bg-white">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                          <BookOpen className="h-5 w-5" />
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-900 leading-tight">{course.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{course.id}</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t border-slate-50">
                       <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-300" />
                          <span className="text-xs font-bold text-slate-500">4 oy</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <BarChart3 className="h-3.5 w-3.5 text-slate-300" />
                          <span className="text-xs font-bold text-slate-500">A1-C1</span>
                       </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                       <Button variant="ghost" size="sm" className="h-9 flex-1 rounded-lg border border-slate-100 text-xs font-bold" onClick={() => { setEditingId(course.id); setEditName(course.name); }}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Tahrirlash
                       </Button>
                       <Button variant="ghost" size="sm" className="h-9 flex-1 rounded-lg border border-slate-100 text-xs font-bold text-rose-500 hover:bg-rose-50" onClick={() => setDeleteId(course.id)}>
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          O'chirish
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={editingId !== null} onOpenChange={v => !v && setEditingId(null)}>
          <DialogContent className="sm:max-w-md rounded-xl p-6">
            <DialogHeader><DialogTitle className="text-lg font-bold">Kursni tahrirlash</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
               <div className="space-y-1">
                 <Label className="text-xs font-bold text-slate-500">Kurs nomi</Label>
                 <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-10 rounded-lg" />
               </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditingId(null)} className="rounded-lg h-10">Bekor qilish</Button>
              <RoseButton onClick={submitEdit} disabled={updateMutation.isPending} className="px-8">
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Saqlash"}
              </RoseButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DeleteConfirmDialog 
          open={deleteId !== null} 
          onOpenChange={v => !v && setDeleteId(null)} 
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isPending}
        />

        <AdminCourseCreateModal open={createOpen} onOpenChange={setCreateOpen} />
      </Main>
    </>
  )
}
