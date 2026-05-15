import { useMemo, useState } from 'react'
import { Loader2, Plus, Search, Trash2, Users as UsersIcon } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import type { Group } from '@/api/service/teacher/group.type'
import { useAdminGroups } from '@/hooks/admin/groups/useAdminGroups'
import { useCreateAdminGroup } from '@/hooks/admin/groups/useCreateAdminGroup'
import { useDeleteAdminGroup } from '@/hooks/admin/groups/useDeleteAdminGroup'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { cn } from '@/lib/utils'

interface Teacher {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Nom kiritilishi shart"),
  course: z.string().min(1, "Kursni tanlang"),
  teacher: z.string().min(1, "Ustozni tanlang"),
  start_date: z.string().min(1, "Sanani tanlang"),
  time_from: z.string().min(1, "Vaqtni tanlang"),
  time_to: z.string().min(1, "Vaqtni tanlang"),
  days: z.array(z.string()).min(1, "Kunlarni tanlang"),
})

type FormValues = z.infer<typeof formSchema>

const DAY_MAP: Record<string, string> = {
  'Du': 'Mon', 'Se': 'Tue', 'Cho': 'Wed', 'Pa': 'Thu', 'Ju': 'Fri', 'Sha': 'Sat', 'Yak': 'Sun'
}

export default function AdminGroupsPage() {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  
  const { data: groups = [], isLoading } = useAdminGroups()
  const { data: courses = [] } = useAdminCourses('')
  const { data: rawTeachersData } = useAdminTeachers()

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '', course: '', teacher: '',
      start_date: new Date().toISOString().split('T')[0],
      time_from: '09:00', time_to: '10:30', days: []
    }
  })

  const teachers = useMemo<Teacher[]>(() => {
    let list: Teacher[] = []
    if (Array.isArray(rawTeachersData)) {
      list = rawTeachersData as Teacher[]
    } else if (rawTeachersData && typeof rawTeachersData === 'object') {
      const anyRaw = rawTeachersData as any
      list = anyRaw.results ?? anyRaw.data ?? anyRaw.teachers ?? anyRaw.user_list ?? []
    }
    return list.filter(t => t.id != null)
  }, [rawTeachersData])

  const createMutation = useCreateAdminGroup()
  const deleteMutation = useDeleteAdminGroup()

  const filtered = useMemo<Group[]>(() => {
    const q = search.trim().toLowerCase()
    const list = Array.isArray(groups) ? groups : []
    return list.filter(g => g.name.toLowerCase().includes(q))
  }, [groups, search])

  const onSubmit = (values: FormValues) => {
    const engDays = values.days.map(d => DAY_MAP[d])
    const payload = {
      name: values.name.trim(),
      course: Number(values.course),
      teacher: Number(values.teacher),
      start_date: values.start_date,
      start_time: values.time_from,
      end_time: values.time_to,
      week_days: engDays.join(','),
      status: 'active' as const
    }

    toast.promise(createMutation.mutateAsync(payload as any), {
      loading: 'Saqlanmoqda...',
      success: () => { 
        setCreateOpen(false)
        reset()
        return 'Guruh yaratildi' 
      },
      error: (err: any) => {
        const errorData = err?.response?.data ?? err?.data ?? err;
        if (typeof errorData === 'object' && errorData !== null) {
          return Object.entries(errorData)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : JSON.stringify(v)}`)
            .join(' | ')
            .slice(0, 100);
        }
        return 'Xatolik yuz berdi';
      }
    })
  }

  return (
    <>
      <AdminHeader fixed />
      <Main fixed className="bg-white font-outfit">
        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">Guruhlar</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Boshqaruv paneli</p>
            </div>
            <Button 
              onClick={() => { reset(); setCreateOpen(true); }} 
              className="rounded-full bg-slate-900 text-white hover:bg-slate-800 px-6 h-11 text-xs font-bold transition-all shadow-lg shadow-slate-100"
            >
               <Plus className="mr-2 h-4 w-4" /> Qo'shish
            </Button>
          </div>

          <div className="mb-8 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Qidirish..." 
              className="h-11 rounded-full bg-slate-50 border-none pl-11 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-200" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          <div className="space-y-3">
             {isLoading ? (
               <div className="py-20 text-center"><Loader2 className="animate-spin inline-block text-slate-200" /></div>
             ) : filtered.length === 0 ? (
               <div className="py-20 text-center text-slate-300 font-medium text-xs">Guruhlar topilmadi</div>
             ) : filtered.map(group => (
               <div key={group.id} className="group flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 rounded-[24px] transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors">
                        <UsersIcon className="h-5 w-5" />
                     </div>
                     <div>
                        <div className="font-bold text-slate-900 text-sm mb-1">{group.name}</div>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID #{group.id}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase">Kurs #{group.course}</span>
                        </div>
                     </div>
                  </div>

                  <div className="hidden md:flex items-center gap-12 text-right text-xs font-bold text-slate-600">
                     <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ustoz</div>
                        <div className="truncate max-w-[120px]">{group.teacher_name || `Ustoz #${group.teacher}`}</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Jadval</div>
                        <div>{Array.isArray(group.week_days) ? group.week_days.join(', ') : (group.week_days || '—')}</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Vaqt</div>
                        <div>{group.start_time?.slice(0, 5)} - {group.end_time?.slice(0, 5)}</div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" className="rounded-full text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-colors" onClick={() => setDeleteId(group.id)}>
                        <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
           <DialogContent className="rounded-[32px] sm:max-w-[440px] p-8 border-none shadow-2xl bg-white">
              <DialogHeader className="mb-8">
                 <DialogTitle className="text-xl font-bold text-slate-900">Guruh qo'shish</DialogTitle>
                 <p className="text-slate-400 text-xs font-medium">Barcha maydonlarni to'ldiring</p>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guruh nomi</Label>
                    <Input placeholder="Nom kiriting" className="h-12 rounded-2xl bg-slate-50 border-none px-5 text-sm font-bold" {...control.register('name')} />
                    {errors.name && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.name.message}</p>}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kurs</Label>
                       <Controller name="course" control={control} render={({ field }) => (
                         <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none px-5 font-bold"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100">
                               {courses.map(c => <SelectItem key={c.id} value={String(c.id)} className="rounded-xl py-2.5 font-bold">{c.name}</SelectItem>)}
                            </SelectContent>
                         </Select>
                       )} />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ustoz</Label>
                       <Controller name="teacher" control={control} render={({ field }) => (
                         <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none px-5 font-bold"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100">
                               {teachers.map(t => <SelectItem key={t.id} value={String(t.id)} className="rounded-xl py-2.5 font-bold">
                                 {t.first_name ? `${t.first_name} ${t.last_name ?? ''}` : t.username}
                               </SelectItem>)}
                            </SelectContent>
                         </Select>
                       )} />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Boshlanish sanasi</Label>
                    <Input type="date" className="h-12 rounded-2xl bg-slate-50 border-none px-5 font-bold" {...control.register('start_date')} />
                 </div>

                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dars kunlari</Label>
                    <div className="flex flex-wrap gap-2">
                       {['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak'].map(day => {
                         const selected = watch('days') || []
                         const isSelected = selected.includes(day)
                         return (
                           <button key={day} type="button" onClick={() => setValue('days', isSelected ? selected.filter(d => d !== day) : [...selected, day], { shouldValidate: true })}
                             className={cn("h-10 px-4 rounded-xl text-[11px] font-black transition-all", isSelected ? "bg-slate-900 text-white shadow-lg shadow-slate-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}>{day}</button>
                         )
                       })}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vaqti (Dan)</Label>
                       <Input type="time" className="h-12 rounded-2xl bg-slate-50 border-none px-5 font-bold" {...control.register('time_from')} />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vaqti (Gacha)</Label>
                       <Input type="time" className="h-12 rounded-2xl bg-slate-50 border-none px-5 font-bold" {...control.register('time_to')} />
                    </div>
                 </div>

                 <DialogFooter className="pt-6 gap-3">
                    <Button variant="ghost" type="button" onClick={() => setCreateOpen(false)} className="flex-1 h-12 rounded-2xl font-bold text-slate-400">Bekor qilish</Button>
                    <Button type="submit" disabled={createMutation.isPending} className="flex-1 h-12 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all">
                      {createMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : 'Saqlash'}
                    </Button>
                 </DialogFooter>
              </form>
           </DialogContent>
        </Dialog>

        <DeleteConfirmDialog 
          open={deleteId !== null} 
          onOpenChange={v => !v && setDeleteId(null)} 
          onConfirm={() => { if(deleteId) toast.promise(deleteMutation.mutateAsync(deleteId), { loading: 'O\'chirilmoqda...', success: 'O\'chirildi', error: 'Xato' }) }}
          isLoading={deleteMutation.isPending}
        />
      </Main>
    </>
  )
}
