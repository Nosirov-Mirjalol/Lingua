import { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { type Notification } from '@/data/notifications-data'
import {
  Inbox,
  Plus,
  Trash2,
  Loader2,
  Search,
  BellRing,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RoseButton } from '@/components/ui/rose-button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ConfigDrawer } from '@/components/config-drawer'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { useBroadcastList, useSendBroadcast } from './hooks'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
  const { data: apiNotifications, isLoading } = useBroadcastList()
  const sendBroadcastMutation = useSendBroadcast()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [formData, setFormData] = useState({ title: '', message: '', type: 'info' as Notification['type'] })

  useEffect(() => {
    if (apiNotifications) {
      const results = Array.isArray(apiNotifications) ? apiNotifications : (apiNotifications as any).results || []
      setNotifications(results.map((n: any) => ({
        id: String(n.id),
        title: n.title || '',
        message: n.message || '',
        type: n.type || 'info',
        timestamp: new Date(n.created_at || Date.now()),
        read: Boolean(n.is_read),
        sender: 'System',
      })))
    }
  }, [apiNotifications])

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTab = activeTab === 'all' || (activeTab === 'unread' && !n.read)
      return matchesSearch && matchesTab
    })
  }, [notifications, searchTerm, activeTab])

  const handleCreate = async () => {
    try {
      await sendBroadcastMutation.mutateAsync(formData)
      setIsCreateModalOpen(false)
      setFormData({ title: '', message: '', type: 'info' })
    } catch (e) { console.error(e) }
  }

  return (
    <>
      <AdminHeader fixed>
        <ConfigDrawer />
      </AdminHeader>

      <Main fixed className="bg-white font-outfit">
        <div className="flex h-full flex-col border-x border-t border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Bildirishnomalar</h1>
              <p className="text-xs text-slate-500">Tizim xabarlari ro'yxati</p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <RoseButton roseSize="sm" className="h-9 px-4">
                  <Plus className="mr-2 h-4 w-4" /> Yangi xabar
                </RoseButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-xl">
                <DialogHeader><DialogTitle className="text-lg font-bold">Xabar yuborish</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-500">Sarlavha</Label>
                    <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="rounded-lg h-10" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-500">Xabar</Label>
                    <Textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-500">Tur</Label>
                    <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v as any})}>
                      <SelectTrigger className="rounded-lg h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Ma'lumot (Info)</SelectItem>
                        <SelectItem value="warning">Ogohlantirish (Warning)</SelectItem>
                        <SelectItem value="error">Xatolik (Error)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                   <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="rounded-lg">Bekor qilish</Button>
                   <RoseButton onClick={handleCreate} disabled={sendBroadcastMutation.isPending} className="px-8">
                     {sendBroadcastMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yuborish"}
                   </RoseButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 border-r border-slate-100 bg-slate-50/50 p-4">
              <nav className="space-y-1">
                {[
                  { id: 'all', label: 'Barchasi', icon: Inbox },
                  { id: 'unread', label: "O'qilmagan", icon: BellRing },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition-all",
                      activeTab === tab.id ? "bg-white text-rose-600 shadow-sm border border-slate-100" : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex flex-1 flex-col">
              <div className="border-b border-slate-100 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Qidirish..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 w-full rounded-lg border-slate-200 bg-slate-50/50 pl-10 focus:bg-white"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-slate-200" /></div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {filtered.map((n) => (
                      <div key={n.id} className={cn("group flex items-start gap-4 p-5 transition-colors hover:bg-slate-50", !n.read && "bg-rose-50/20")}>
                        <div className={cn("mt-1.5 h-2 w-2 rounded-full", !n.read ? "bg-rose-500" : "bg-transparent")} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                            <span className="text-[10px] text-slate-400">{format(n.timestamp, 'dd.MM.yyyy HH:mm')}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600 leading-snug">{n.message}</p>
                          <div className="mt-2 flex items-center gap-2">
                             <Badge variant="outline" className="text-[9px] h-4 border-slate-100 text-slate-400 font-bold">{n.type.toUpperCase()}</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 rounded-lg" onClick={() => setDeleteId(n.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>

        <DeleteConfirmDialog 
          open={deleteId !== null} 
          onOpenChange={(v) => !v && setDeleteId(null)} 
          onConfirm={() => {
            // API delete call here
            toast.success("O'chirildi")
            setDeleteId(null)
          }}
        />
      </Main>
    </>
  )
}
