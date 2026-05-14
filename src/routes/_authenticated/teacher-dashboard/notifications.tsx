import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Bell, BookOpen, MessageSquare, CheckCheck, GraduationCap, Loader2 } from 'lucide-react'
import { useMyNotifications, useUnreadCount, useMarkAsRead, useMarkAllRead } from '@/features/notifications/hooks'

export const Route = createFileRoute('/_authenticated/teacher-dashboard/notifications')({
  component: NotificationsPage,
})

// ─── Types ───────────────────────────────────────────────────────────────────

type IconKey = 'bell' | 'message' | 'book' | 'linguapro'
type CatKey = 'topshiriq' | 'chat' | 'linguapro'

type UINotification = {
  id: number
  title: string
  body: string
  time: string
  icon: IconKey
  read: boolean
  category: string
  catKey: CatKey
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function deriveCategory(title: string): { icon: IconKey; catKey: CatKey; category: string } {
  const t = title.toLowerCase()
  if (t.includes('vazifa') || t.includes('topshiriq')) return { icon: 'book', catKey: 'topshiriq', category: 'Topshiriq' }
  if (t.includes('xabar') || t.includes('chat')) return { icon: 'message', catKey: 'chat', category: 'Chat' }
  return { icon: 'linguapro', catKey: 'linguapro', category: 'LinguaPro' }
}

// ─── Config ──────────────────────────────────────────────────────────────────

const ICON_CONFIG: Record<IconKey, { icon: React.ElementType; color: string; bg: string; dot: string; badge: string }> = {
  bell:      { icon: Bell,          color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30', dot: 'bg-violet-500', badge: 'bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-300' },
  book:      { icon: BookOpen,      color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30', dot: 'bg-violet-500', badge: 'bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-300' },
  message:   { icon: MessageSquare, color: 'text-teal-600 dark:text-teal-400',   bg: 'bg-teal-50 dark:bg-teal-950/30',   dot: 'bg-teal-500',   badge: 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300'   },
  linguapro: { icon: GraduationCap, color: 'text-rose-600 dark:text-rose-400',   bg: 'bg-rose-50 dark:bg-rose-950/30',   dot: 'bg-rose-500',   badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'   },
}

const ACCENT_BORDER: Record<CatKey, string> = {
  topshiriq: 'border-l-violet-500',
  chat:      'border-l-teal-500',
  linguapro: 'border-l-rose-500',
}

// ─── Component ───────────────────────────────────────────────────────────────

function NotificationsPage() {
  const { data: apiNotifications = [], isLoading, error } = useMyNotifications()
  const { data: unreadData } = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAllRead = useMarkAllRead()

  const notifications = useMemo<UINotification[]>(() =>
    apiNotifications.map((n) => {
      const derived = deriveCategory(n.title)
      return { id: n.id, title: n.title, body: n.message, time: formatRelativeTime(n.created_at), read: n.is_read, ...derived }
    }), [apiNotifications])

  const unreadCount = unreadData?.unread_count ?? notifications.filter((n) => !n.read).length

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-rose-500" />
    </div>
  )

  if (error) return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20 p-6 text-center">
        <p className="text-rose-700 dark:text-rose-400">Xatolik yuz berdi.</p>
        <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700">
          Qayta yuklash
        </button>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Bildirishnomalar</h1>
          <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">
            {unreadCount > 0 ? `Sizda ${unreadCount} ta o'qilmagan yangilik bor` : "Hamma xabarlar ko'zdan kechirildi"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => !markAllRead.isPending && markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2.5 text-sm font-bold text-white dark:text-slate-900 transition-all hover:bg-slate-700 dark:hover:bg-slate-200 active:scale-95 disabled:opacity-60"
          >
            {markAllRead.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCheck size={16} />}
            Barchasini o'qilgan deb belgilash
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600">
              <Bell size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Hozircha xabarlar yo'q</h3>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Yangi bildirishnomalar paydo bo'lganda shu yerda ko'rasiz.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const config = ICON_CONFIG[n.icon]
            const Icon = config.icon
            const isPendingThis = markAsRead.isPending && markAsRead.variables === n.id

            return (
              <div
                key={n.id}
                onClick={() => !n.read && !isPendingThis && markAsRead.mutate(n.id)}
                className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border border-l-4 p-5 transition-all duration-200 ${
                  n.read
                    ? 'border-slate-100 dark:border-slate-800 border-l-slate-200 dark:border-l-slate-700 bg-slate-50 dark:bg-slate-900/40'
                    : `border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 ${ACCENT_BORDER[n.catKey]} shadow-sm hover:shadow-md`
                }`}
              >
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${n.read ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' : `${config.bg} ${config.color}`}`}>
                    {isPendingThis ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
                  </div>
                  {!n.read && (
                    <span className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${config.dot}`} />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${n.read ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : config.badge}`}>
                      {n.category}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{n.time}</span>
                  </div>
                  <h3 className={`text-sm leading-snug ${n.read ? 'font-medium text-slate-500 dark:text-slate-400' : 'font-bold text-slate-900 dark:text-white'}`}>
                    {n.title}
                  </h3>
                  <p className={`mt-1 text-sm leading-relaxed ${n.read ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                    {n.body}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}