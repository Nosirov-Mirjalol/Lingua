import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { BellRing, Inbox, Loader2, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoseButton } from '@/components/ui/rose-button'
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
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { ListPagination } from '@/components/list-pagination'
import { NotificationCard } from '@/components/shared/NotificationCard'
import { useBroadcastList, useSendBroadcast } from './hooks'
import type { BroadcastTargetRole } from './types'

export default function NotificationsPage() {
  const { data: apiNotifications, isLoading, error } = useBroadcastList()
  const sendBroadcastMutation = useSendBroadcast()

  const notifications = useMemo(() => {
    if (!apiNotifications) return []
    if (error) return []
    try {
      const results = Array.isArray(apiNotifications)
        ? apiNotifications
        : (apiNotifications as { results?: unknown[] }).results || []
      const fallbackTimestamp = new Date('2024-01-01')
      return results.map((n: unknown) => {
        const item = n as {
          id?: unknown
          title?: unknown
          message?: unknown
          created_at?: unknown
          is_read?: unknown
          target_role?: unknown
        }
        const createdAt = item.created_at
        return {
          id: String(item.id || ''),
          title: String(item.title || ''),
          message: String(item.message || ''),
          target_role:
            (item.target_role as BroadcastTargetRole | undefined) || 'all',
          timestamp: createdAt
            ? new Date(createdAt as string | number)
            : fallbackTimestamp,
          read: Boolean(item.is_read),
          sender: 'System',
        }
      })
    } catch {
      return []
    }
  }, [apiNotifications, error])
  const [activeTab, setActiveTab] = useState<BroadcastTargetRole>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_role: 'all' as BroadcastTargetRole,
  })

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch = n.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesTab = activeTab === 'all' || n.target_role === activeTab
      const notDeleted = !deletedIds.has(n.id)
      return matchesSearch && matchesTab && notDeleted
    })
  }, [notifications, searchTerm, activeTab, deletedIds])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const paginatedNotifications = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage, pageSize])

  const handleCreate = async () => {
    try {
      await sendBroadcastMutation.mutateAsync(formData)
      setIsCreateModalOpen(false)
      setFormData({ title: '', message: '', target_role: 'all' })
    } catch {
      toast.error('Xatolik yuz berdi')
    }
  }

  const roleLabel: Record<BroadcastTargetRole, string> = {
    all: 'ALL',
    teacher: 'TEACHER',
    student: 'STUDENT',
  }

  return (
    <>
      <AdminHeader fixed>
        <ConfigDrawer />
      </AdminHeader>
      <Main>
        <div className='bg-white font-outfit dark:bg-slate-950'>
          <div className='flex min-h-[calc(100vh-7rem)] flex-col border-x border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'>
            <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800'>
              <div>
                <h1 className='text-xl font-bold text-slate-900 dark:text-slate-50'>
                  Bildirishnomalar
                </h1>
                <p className='text-xs text-slate-400 dark:text-slate-400'>
                  Tizim xabarlari ro'yxati
                </p>
              </div>
              <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
              >
                <DialogTrigger asChild>
                  <RoseButton roseSize='sm' className='h-9 px-4'>
                    <Plus className='mr-2 h-4 w-4' /> Yangi xabar
                  </RoseButton>
                </DialogTrigger>
                <DialogContent className='rounded-xl bg-white sm:max-w-md dark:bg-slate-900'>
                  <DialogHeader>
                    <DialogTitle className='text-lg font-bold dark:text-slate-50'>
                      Xabar yuborish
                    </DialogTitle>
                  </DialogHeader>
                  <div className='space-y-4 py-4'>
                    <div className='space-y-1'>
                      <Label className='text-xs font-bold text-slate-500 dark:text-slate-400'>
                        Sarlavha
                      </Label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className='h-10 rounded-lg dark:bg-slate-800 dark:text-slate-100'
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs font-bold text-slate-500 dark:text-slate-400'>
                        Xabar
                      </Label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className='rounded-lg dark:bg-slate-800 dark:text-slate-100'
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs font-bold text-slate-500 dark:text-slate-400'>
                        Kimga
                      </Label>
                      <Select
                        value={formData.target_role}
                        onValueChange={(v) =>
                          setFormData({
                            ...formData,
                            target_role: v as BroadcastTargetRole,
                          })
                        }
                      >
                        <SelectTrigger className='h-10 rounded-lg dark:bg-slate-800 dark:text-slate-100'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='teacher'>Teacher</SelectItem>
                          <SelectItem value='student'>Student</SelectItem>
                          <SelectItem value='all'>All</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant='ghost'
                      onClick={() => setIsCreateModalOpen(false)}
                      className='rounded-lg dark:hover:bg-slate-800'
                    >
                      Bekor qilish
                    </Button>
                    <RoseButton
                      onClick={handleCreate}
                      disabled={sendBroadcastMutation.isPending}
                      className='px-8'
                    >
                      {sendBroadcastMutation.isPending ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        'Yuborish'
                      )}
                    </RoseButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className='flex min-h-0 flex-1'>
              <div className='w-64 border-r border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40'>
                <nav className='space-y-1'>
                  {[
                    { id: 'all', label: 'Barchasi', icon: Inbox },
                    { id: 'teacher', label: 'Teacher', icon: BellRing },
                    { id: 'student', label: 'Student', icon: BellRing },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as BroadcastTargetRole)
                        setPage(1)
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition-all',
                        activeTab === tab.id
                          ? 'border border-slate-100 bg-white text-rose-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-rose-400 dark:shadow-none'
                          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      )}
                    >
                      <tab.icon className='h-4 w-4' />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className='flex min-w-0 flex-1 flex-col'>
                <div className='border-b border-slate-100 p-4 dark:border-slate-800'>
                  <div className='relative'>
                    <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500' />
                    <Input
                      placeholder='Qidirish...'
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setPage(1)
                      }}
                      className='h-10 w-full rounded-lg border-slate-200 bg-slate-50/50 pl-10 focus:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-950'
                    />
                  </div>
                </div>

                <div className='min-h-0 flex-1'>
                  <ScrollArea className='h-full'>
                    {isLoading ? (
                      <div className='flex h-40 items-center justify-center'>
                        <Loader2 className='animate-spin text-slate-200 dark:text-slate-700' />
                      </div>
                    ) : error ? (
                      <div className='flex h-40 flex-col items-center justify-center gap-2'>
                        <p className='text-sm font-bold text-slate-500 dark:text-slate-400'>
                          Xatolik yuz berdi
                        </p>
                        <p className='text-xs text-slate-400 dark:text-slate-500'>
                          Server bilan bog'lanishda muammo
                        </p>
                      </div>
                    ) : (
                      <div className='divide-y divide-slate-50 dark:divide-slate-800'>
                        {paginatedNotifications.map((n) => (
                          <div
                            key={n.id}
                            className='group relative flex w-full items-center gap-2' // w-full qo'shildi
                          >
                            <NotificationCard
                              title={n.title}
                              message={n.message}
                              time={format(n.timestamp, 'dd.MM.yyyy HH:mm')}
                              isRead={n.read}
                              className='flex-1 pr-24' // O'ng tarafdagi tugmalar uchun joy qoldiradi
                            />

                            {/* Absolute Actions (Badge + Delete) */}
                            <div className='absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5'>
                              <Badge
                                variant='outline'
                                className='h-5 border-slate-100 px-1.5 text-[10px] font-bold text-slate-400 dark:border-slate-700 dark:text-slate-500'
                              >
                                {roleLabel[n.target_role]}
                              </Badge>
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                aria-label='Delete'
                                className='h-7 w-7 rounded-lg text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400'
                                onClick={() => setDeleteId(n.id)}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {!isLoading && !error && filtered.length > 0 && (
                    <div className='border-t pt-10 border-slate-100 px-4 py-2 dark:border-slate-800'>
                      <ListPagination
                        page={safePage}
                        pageSize={pageSize}
                        totalCount={filtered.length}
                        onPageChange={setPage}
                        onPageSizeChange={(nextPageSize) => {
                          setPageSize(nextPageSize)
                          setPage(1)
                        }}
                        className='mt-0'
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DeleteConfirmDialog
          open={deleteId !== null}
          onOpenChange={(v) => !v && setDeleteId(null)}
          onConfirm={() => {
            if (deleteId) {
              setDeletedIds((prev) => new Set(prev).add(deleteId))
              toast.success("O'chirildi")
              setDeleteId(null)
            }
          }}
        />
      </Main>
    </>
  )
}
