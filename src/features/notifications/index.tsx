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
import {
  adminDialogClass,
  adminInputClass,
  adminLabelClass,
  adminPageSubtitleClass,
  adminPageTitleClass,
} from '@/lib/admin-ui'
import { useBroadcastList, useSendBroadcast } from './hooks'
import type { BroadcastTargetRole } from './types'

const TABS: Array<{
  id: BroadcastTargetRole
  label: string
  icon: typeof Inbox
}> = [
  { id: 'all', label: 'Barchasi', icon: Inbox },
  { id: 'teacher', label: 'Teacher', icon: BellRing },
  { id: 'student', label: 'Student', icon: BellRing },
]

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
      <Main className='admin-page bg-background font-outfit'>
        <div className='admin-notifications admin-page__container flex min-h-0 flex-1 flex-col'>
          <header className='admin-notifications__header admin-page__header shrink-0'>
            <div>
              <h1 className={adminPageTitleClass}>Bildirishnomalar</h1>
              <p className={adminPageSubtitleClass}>
                Tizim xabarlari ro&apos;yxati
              </p>
            </div>
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <RoseButton roseSize='sm' className='admin-page__cta h-9 px-4'>
                  <Plus className='mr-2 h-4 w-4' /> Yangi xabar
                </RoseButton>
              </DialogTrigger>
              <DialogContent className={cn(adminDialogClass, 'sm:max-w-md')}>
                <DialogHeader>
                  <DialogTitle>Xabar yuborish</DialogTitle>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div className='space-y-1'>
                    <Label className={adminLabelClass}>Sarlavha</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className={cn(adminInputClass, 'h-10')}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label className={adminLabelClass}>Xabar</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className={adminInputClass}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label className={adminLabelClass}>Kimga</Label>
                    <Select
                      value={formData.target_role}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          target_role: v as BroadcastTargetRole,
                        })
                      }
                    >
                      <SelectTrigger className={cn(adminInputClass, 'h-10')}>
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
                <DialogFooter className='flex-col-reverse gap-2 sm:flex-row'>
                  <Button
                    variant='ghost'
                    onClick={() => setIsCreateModalOpen(false)}
                    className='w-full sm:w-auto'
                  >
                    Bekor qilish
                  </Button>
                  <RoseButton
                    onClick={handleCreate}
                    disabled={sendBroadcastMutation.isPending}
                    className='w-full px-8 sm:w-auto'
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
          </header>

          {/* Mobil: gorizontal tablar */}
          <nav
            className='admin-notifications__tabs-mobile flex shrink-0 gap-2 overflow-x-auto pb-3 md:hidden'
            aria-label='Filtr'
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type='button'
                onClick={() => {
                  setActiveTab(tab.id)
                  setPage(1)
                }}
                className={cn(
                  'flex shrink-0 items-center gap-2 px-4 py-2 transition-all',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <tab.icon className='h-3.5 w-3.5' />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className='admin-notifications__body flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:flex-row'>
            {/* Desktop: yon menyu */}
            <aside className='admin-notifications__sidebar hidden shrink-0 border-r border-border bg-muted/30 p-4 md:block md:w-52 lg:w-56'>
              <nav className='space-y-1'>
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type='button'
                    onClick={() => {
                      setActiveTab(tab.id)
                      setPage(1)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 transition-all',
                      activeTab === tab.id
                        ? 'border border-border bg-card text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <tab.icon className='h-4 w-4 shrink-0' />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </aside>

            <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
              <div className='shrink-0 border-b border-border p-3 sm:p-4'>
                <div className='relative'>
                  <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Qidirish...'
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setPage(1)
                    }}
                    className={cn(adminInputClass, 'h-10 bg-muted/50 pl-10')}
                  />
                </div>
              </div>

              <ScrollArea className='min-h-0 flex-1'>
                {isLoading ? (
                  <div className='flex h-40 items-center justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                  </div>
                ) : error ? (
                  <div className='flex h-40 flex-col items-center justify-center gap-2 px-4 text-center'>
                    <p className='text-sm font-bold text-muted-foreground'>
                      Xatolik yuz berdi
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Server bilan bog&apos;lanishda muammo
                    </p>
                  </div>
                ) : paginatedNotifications.length === 0 ? (
                  <div className='flex h-40 items-center justify-center px-4 text-sm text-muted-foreground'>
                    Bildirishnomalar topilmadi
                  </div>
                ) : (
                  <div className='divide-y divide-border'>
                    {paginatedNotifications.map((n) => (
                      <div
                        key={n.id}
                        className='admin-notifications__item flex flex-col gap-2 sm:flex-row sm:items-center'
                      >
                        <NotificationCard
                          title={n.title}
                          message={n.message}
                          time={format(n.timestamp, 'dd.MM.yyyy HH:mm')}
                          isRead={n.read}
                          className='min-w-0 flex-1'
                        />
                        <div className='flex shrink-0 items-center justify-end gap-2 px-4 pb-3 sm:flex-col sm:items-end sm:justify-center sm:px-3 sm:pb-0'>
                          <Badge
                            variant='outline'
                            className='admin-text-caption h-5 px-1.5'
                          >
                            {roleLabel[n.target_role]}
                          </Badge>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            aria-label="O'chirish"
                            className='h-8 w-8 text-muted-foreground hover:text-destructive'
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
                <div className='shrink-0 border-t border-border px-3 py-2 sm:px-4'>
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
