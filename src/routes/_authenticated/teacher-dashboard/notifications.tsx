import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { NotificationCard } from '@/components/shared/NotificationCard'
import { ListPagination } from '@/components/list-pagination'
import {
  useMyNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllRead,
} from '@/features/notifications/hooks'

export const Route = createFileRoute('/_authenticated/teacher-dashboard/notifications')({
  component: NotificationsPage,
})

type UINotification = {
  id: number
  title: string
  body: string
  time: string
  read: boolean
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (m < 1) return 'Hozirgina'
  if (m < 60) return `${m} daqiqa oldin`
  if (h < 24) return `${h} soat oldin`
  return `${d} kun oldin`
}

function NotificationsPage() {
  const { data: apiNotifications = [], isLoading, error } = useMyNotifications()
  const { data: unreadData } = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAllRead = useMarkAllRead()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const notifications = useMemo<UINotification[]>(
    () =>
      apiNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.message,
        time: formatRelativeTime(n.created_at),
        read: n.is_read,
      })),
    [apiNotifications]
  )

  const unreadCount =
    unreadData?.unread_count ?? notifications.filter((n) => !n.read).length

  const totalPages = Math.max(1, Math.ceil(notifications.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const paginatedNotifications = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return notifications.slice(start, start + pageSize)
  }, [notifications, safePage, pageSize])

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-rose-500" />
      </div>
    )

  if (error)
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/30 dark:bg-rose-950/20">
          <p className="text-rose-700 dark:text-rose-400">Xatolik yuz berdi.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
          >
            Qayta yuklash
          </button>
        </div>
      </div>
    )

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Bildirishnomalar
          </h1>
          <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">
            {unreadCount > 0
              ? `Sizda ${unreadCount} ta o'qilmagan yangilik bor`
              : "Hamma xabarlar ko'zdan kechirildi"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => !markAllRead.isPending && markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {markAllRead.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCheck size={16} />
            )}
            Barchasini o'qilgan deb belgilash
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
              <Bell size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hozircha xabarlar yo'q
            </h3>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              Yangi bildirishnomalar paydo bo'lganda shu yerda ko'rasiz.
            </p>
          </div>
        ) : (
          <>
            {paginatedNotifications.map((n) => {
              const isPendingThis =
                markAsRead.isPending && markAsRead.variables === n.id

              return (
                <div key={n.id} className={n.read ? 'opacity-70' : undefined}>
                  <NotificationCard
                    title={n.title}
                    message={n.body}
                    time={isPendingThis ? 'Yuklanmoqda...' : n.time}
                    isRead={n.read}
                    onClick={() => !n.read && !isPendingThis && markAsRead.mutate(n.id)}
                  />
                </div>
              )
            })}
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <ListPagination
                page={safePage}
                pageSize={pageSize}
                totalCount={notifications.length}
                onPageChange={setPage}
                onPageSizeChange={(nextPageSize) => {
                  setPageSize(nextPageSize)
                  setPage(1)
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

