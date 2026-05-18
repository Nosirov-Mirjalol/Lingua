import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, Mail, Phone, Search, Loader2, MoreVertical, Filter, ChevronRight, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'
import { useDeleteAdminTeacher } from '@/hooks/admin/teachers/useDeleteAdminTeacher'
import { useUpdateAdminTeacher } from '@/hooks/admin/teachers/useUpdateAdminTeacher'
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
import { AdminTeacherCreateModal } from '@/features/admin-teachers/components/admin-teacher-create-modal'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AdminTeachersPage() {
  const { data: rawTeachers = [], isLoading, isError } = useAdminTeachers()
  const deleteMutation = useDeleteAdminTeacher()
  const updateMutation = useUpdateAdminTeacher()
  
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', phone: '', active: true })

  const teachers = useMemo(() => {
    if (Array.isArray(rawTeachers)) return rawTeachers
    if (rawTeachers && typeof rawTeachers === 'object') {
       const anyRaw = rawTeachers as any
       return anyRaw.results || anyRaw.data || anyRaw.teachers || []
    }
    return []
  }, [rawTeachers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return teachers.filter((t: any) =>
      (t.first_name || '').toLowerCase().includes(q) || 
      (t.last_name || '').toLowerCase().includes(q) || 
      (t.email || '').toLowerCase().includes(q)
    )
  }, [teachers, search])

  const startEdit = (teacher: any) => {
    setEditingTeacher(teacher)
    setEditForm({
      first_name: teacher.first_name || '',
      last_name: teacher.last_name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      active: teacher.is_active ?? true
    })
  }

  const submitEdit = () => {
    if (!editingTeacher) return
    toast.promise(updateMutation.mutateAsync({
      id: editingTeacher.id,
      data: {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        phone: editForm.phone,
        is_active: editForm.active
      }
    }), {
      loading: 'Yangilanmoqda...',
      success: () => { setEditingTeacher(null); return 'Yangilandi' },
      error: 'Xatolik yuz berdi'
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
      <AdminHeader fixed />

      <Main fixed className="bg-slate-50/40 font-outfit">
        <div className="container mx-auto p-6 max-w-[1400px]">
          
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black tracking-widest text-rose-600 uppercase mb-1">Ustozlar boshqaruvi</p>
              <h1 className="text-3xl font-bold text-slate-900">O'qituvchilar (Teachers)</h1>
            </div>
            <RoseButton onClick={() => setCreateOpen(true)} className="rounded-full px-8">
               <Plus className="mr-2 h-4 w-4" /> Ustoz qo'shish
            </RoseButton>
          </div>

          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
            <div className="p-6 border-b border-slate-50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
               <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-full w-fit">
                  {['Hammasi', 'Faol', 'Nofaol'].map(tab => (
                    <button key={tab} className={cn("px-6 py-2 rounded-full text-xs font-bold transition-all", tab === 'Hammasi' ? "bg-rose-600 text-white shadow-md shadow-rose-200 dark:shadow-none" : "text-slate-500")}>
                      {tab}
                    </button>
                  ))}
               </div>
               <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input 
                      placeholder="Ustozlarni qidirish..." 
                      className="h-10 w-64 rounded-full bg-slate-50 border-none pl-10 text-xs font-medium" 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-400"><Filter className="h-4 w-4" /></Button>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-slate-50 bg-slate-50/30">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">F.I.SH</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Telefon</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Guruhlar</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Reyting</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {isLoading ? (
                       <tr><td colSpan={7} className="p-10 text-center"><Loader2 className="animate-spin inline-block text-slate-200" /></td></tr>
                     ) : filtered.map((t: any) => (
                       <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                   <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.username}`} />
                                   <AvatarFallback>{t.first_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                   <div className="text-sm font-bold text-slate-900">{t.first_name} {t.last_name}</div>
                                   <div className="text-[10px] text-slate-400 font-bold uppercase">@{t.username}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-medium text-slate-600">{t.email}</td>
                          <td className="px-6 py-5 text-sm font-medium text-slate-600">{t.phone || '—'}</td>
                          <td className="px-6 py-5">
                             <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold border-none px-2 h-6">0ta guruh</Badge>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-1 text-amber-500">
                                <Star className="h-3 w-3 fill-current" />
                                <span className="text-xs font-black">4.8</span>
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <Badge className={cn("rounded-md text-[9px] font-black border-none px-2 h-5", t.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-300")}>
                                {t.is_active ? "FAOL" : "NOFAOL"}
                             </Badge>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => startEdit(t)}>
                                   <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-500 hover:bg-rose-50" onClick={() => setDeleteId(t.id)}>
                                   <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </Card>
        </div>

        {/* Improved Edit Modal */}
        <Dialog open={editingTeacher !== null} onOpenChange={v => !v && setEditingTeacher(null)}>
          <DialogContent className="rounded-[32px] sm:max-w-[420px] p-8 border-none shadow-2xl">
            <DialogHeader className="mb-6">
               <DialogTitle className="text-2xl font-bold text-slate-900">Ustozni tahrirlash</DialogTitle>
               <p className="text-sm text-slate-400 font-medium">O'qituvchi ma'lumotlarini yangilang.</p>
            </DialogHeader>
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ism</Label>
                   <Input value={editForm.first_name} onChange={e => setEditForm({...editForm, first_name: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none px-4 font-bold" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Familiya</Label>
                   <Input value={editForm.last_name} onChange={e => setEditForm({...editForm, last_name: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none px-4 font-bold" />
                 </div>
               </div>
               <div className="space-y-2">
                 <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</Label>
                 <Input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none px-4 font-bold" />
               </div>
               <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                  <span className="text-xs font-bold text-slate-600">Status: {editForm.active ? "Faol" : "Nofaol"}</span>
                  <Checkbox checked={editForm.active} onCheckedChange={v => setEditForm({...editForm, active: v as boolean})} />
               </div>
            </div>
            <DialogFooter className="mt-8 gap-3 sm:gap-0">
              <Button variant="ghost" onClick={() => setEditingTeacher(null)} className="flex-1 h-12 rounded-full font-bold text-slate-400 hover:bg-slate-50">Bekor qilish</Button>
              <RoseButton onClick={submitEdit} disabled={updateMutation.isPending} className="flex-[2] h-12 rounded-full">
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

        <AdminTeacherCreateModal open={createOpen} onOpenChange={setCreateOpen} />
      </Main>
    </>
  )
}
