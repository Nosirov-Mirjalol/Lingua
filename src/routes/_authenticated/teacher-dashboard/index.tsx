import { useEffect, useState, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Users,
  ClipboardCheck,
  MessageSquare,
  ChevronRight,
  Loader,
  Eye,
  Loader2,
  CalendarDays,
} from 'lucide-react'
import { useGroupSchedule } from '@/hooks/teacher/groups/useGroupSchedule'
import { useTeacherGroups } from '@/hooks/teacher/groups/useTeacherGroups'
import { useProfile } from '@/hooks/teacher/profile/useProfile'
import { useGetAssignments, useGetAssignmentStatus } from '@/hooks/useAssignments'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DashboardCard } from '@/components/dashboard-card'
import { useUnreadCount } from '@/features/notifications/hooks'

// ─── Utils ────────────────────────────────────────────────────────────────────

const formatClock = (v?: string) =>
  v ? v.split(':').slice(0, 2).join(':') : null
const formatTimeRange = (start?: string, end?: string) =>
  [formatClock(start), formatClock(end)].filter(Boolean).join(' – ')

const formatRelativeDate = (dateStr: string, now: number) => {
  const d = new Date(dateStr)
  const diffDays = Math.ceil((d.getTime() - now) / 86_400_000)
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const months = [
    'Yan',
    'Fev',
    'Mar',
    'Apr',
    'May',
    'Iyun',
    'Iyul',
    'Avg',
    'Sen',
    'Okt',
    'Noy',
    'Dek',
  ]

  if (diffDays === 0) return `Bugun ${time}`
  if (diffDays === 1) return `Ertaga ${time}`
  if (diffDays < 0) return `${Math.abs(diffDays)} kun oldin`
  if (diffDays <= 7) return `${diffDays} kun qoldi • ${time}`
  return `${d.getDate()}-${months[d.getMonth()]} ${time}`
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

const urgencyConfig = (daysLeft: number) => ({
  dot:
    daysLeft <= 1
      ? 'bg-red-500'
      : daysLeft <= 3
        ? 'bg-amber-400'
        : 'bg-emerald-500',
  badge:
    daysLeft <= 1
      ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
      : daysLeft <= 3
        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  label: `${daysLeft} kun qoldi`,
})

// ─── Components ───────────────────────────────────────────────────────────────

const SectionCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={`rounded-2xl bg-white p-4 shadow-sm md:p-6 dark:bg-slate-900 dark:shadow-md ${className}`}
  >
    {children}
  </div>
)

const LinkBtn = ({ onClick, loading, variant = 'primary', children }: any) => (
  <button
    type='button'
    onClick={onClick}
    disabled={loading}
    className={`flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
      variant === 'primary'
        ? 'text-[#b80035] hover:underline dark:text-rose-400'
        : 'rounded-lg px-3 py-1.5 text-[#b80035] hover:bg-rose-50 active:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-950/50'
    }`}
  >
    {loading ? (
      <>
        <Loader size={14} className='animate-spin' /> Yuklanmoqda...
      </>
    ) : (
      children
    )}
    {variant === 'primary' && !loading && <ChevronRight size={14} />}
  </button>
)

// ─── Assignment Row Component ─────────────────────────────────────────────────

const AssignmentRow = ({ a, now }: { a: any; now: number }) => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const { data: statusData, isLoading: loading } = useGetAssignmentStatus(open ? a.id : null)

  const daysLeft = Math.ceil(
    (new Date(a.deadline).getTime() - now) / 86_400_000
  )
  const urg = urgencyConfig(daysLeft)

<<<<<<< HEAD
  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && !statusData) {
      setLoading(true)
      try {
        const token = localStorage.getItem('access_token')
        const res = await fetch(
          `http://185.190.143.64:8000/api/assignments/${a.id}/status/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        )
        if (res.ok) setStatusData(await res.json())
      } finally {
        setLoading(false)
      }
    }
  }

=======
>>>>>>> b0ebaf4aab0b520dc3332ccc363bf8e993f7202d
  const total = statusData?.length ?? 0
  const submitted =
    statusData?.filter((x: any) => x.status === 'topshirgan').length ?? 0
  const pct = total ? Math.round((submitted / total) * 100) : 0

  return (
    <div className='flex items-center gap-4 py-3.5 first:pt-0 last:pb-0'>
      <div className='relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#b80035]/10 text-xs font-bold text-[#b80035] dark:bg-rose-950/50 dark:text-rose-400'>
        {getInitials(a.title)}
        <span
          className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 ${urg.dot}`}
        />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-semibold text-slate-800 dark:text-slate-100'>
          {a.title}
        </p>
        <p className='truncate text-xs text-slate-400'>
          Guruh {a.group} · {formatRelativeDate(a.deadline, now)}
        </p>
      </div>
      <div className='flex shrink-0 items-center gap-2'>
        <span
          className={`hidden rounded-lg px-2 py-0.5 text-[11px] font-semibold sm:block ${urg.badge}`}
        >
          {urg.label}
        </span>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'>
              {loading ? (
                <Loader2 size={15} className='animate-spin' />
              ) : (
                <Eye size={15} />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align='end'
            className='w-60 rounded-2xl p-4 shadow-xl dark:bg-slate-900'
          >
            {loading ? (
              <div className='flex items-center gap-2 text-sm text-slate-500'>
                <Loader2 size={14} className='animate-spin' /> Yuklanmoqda...
              </div>
            ) : statusData ? (
              <div className='space-y-3'>
                <p className='text-sm font-bold text-slate-800 dark:text-white'>
                  Topshirish holati
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='rounded-xl bg-emerald-50 px-3 py-2.5 dark:bg-emerald-950/50'>
                    <p className='text-[10px] font-semibold text-emerald-600 uppercase'>
                      Topshirgan
                    </p>
                    <p className='mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300'>
                      {submitted}
                    </p>
                  </div>
                  <div className='rounded-xl bg-rose-50 px-3 py-2.5 dark:bg-rose-950/50'>
                    <p className='text-[10px] font-semibold text-rose-600 uppercase'>
                      Topshirmagan
                    </p>
                    <p className='mt-1 text-xl font-bold text-rose-700 dark:text-rose-300'>
                      {total - submitted}
                    </p>
                  </div>
                </div>
                <div>
                  <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700'>
                    <div
                      className='h-full rounded-full bg-[#b80035] transition-all'
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className='mt-1.5 text-[11px] text-slate-400'>
                    {submitted}/{total} talaba topshirdi · {pct}%
                  </p>
                </div>
              </div>
            ) : (
              <p className='text-sm text-slate-500'>Holat topilmadi</p>
            )}
          </PopoverContent>
        </Popover>

        <LinkBtn
          variant='secondary'
          onClick={() =>
            navigate({
              to: '/teacher-dashboard/homework',
              search: { assignmentId: a.id },
            })
          }
        >
          Ko'rish
        </LinkBtn>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/_authenticated/teacher-dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { data: groups = [], isLoading: loadingGroups } = useTeacherGroups()
  const { data: unreadData, isLoading: loadingUnread } = useUnreadCount()
  const { data: profile } = useProfile()
  const { data: assignments = [], isLoading: loadingAssignments } =
    useGetAssignments()

  const [now, setNow] = useState(Date.now)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  const formattedDate = useMemo(() => {
    if (!calendarDate) return undefined
    return calendarDate.toLocaleDateString('en-CA') // YYYY-MM-DD format
  }, [calendarDate])

  const { data: scheduleItems = [], isLoading: loadingSchedule } =
    useGroupSchedule(formattedDate)

  const groupIds = new Set(groups.map((g) => g.id))
  const pendingAssignments = assignments.filter(
    (a) =>
      groupIds.has(a.group) &&
      new Date(a.deadline).getTime() > now &&
      a.is_active
  )

  const activeGroupsCount = groups.filter((g) => g.status === 'active').length
  const studentsCount = new Set(
    groups.flatMap((g) => g.students.map((s) => s.student))
  ).size

  return (
    <>
      <div className='mb-7'>
        <p className='mb-1 text-xs font-semibold tracking-widest text-[#b80035] uppercase dark:text-rose-400'>
          O'qituvchi paneli
        </p>
        <h1 className='text-2xl font-bold text-slate-900 md:text-3xl dark:text-white'>
          Xush kelibsiz,{' '}
          <span className='text-[#b80035] dark:text-rose-400'>
            {profile?.full_name || profile?.username || "O'qituvchi"}
          </span>
          !
        </h1>
        <p className='mt-1.5 text-sm text-slate-500 dark:text-slate-400'>
          Bugungi darslar va topshiriqlaringiz quyida.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className='mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5'>
        <DashboardCard
          title='FAOL GURUHLAR'
          value={loadingGroups ? '–' : String(activeGroupsCount)}
          icon={Users}
        />
        <DashboardCard
          title="O'QUVCHILAR"
          value={loadingGroups ? '–' : String(studentsCount)}
          icon={Users}
        />
        <DashboardCard
          title='TOPSHIRIQLAR'
          value={loadingAssignments ? '–' : String(pendingAssignments.length)}
          status={pendingAssignments.length > 0 ? 'Faol' : undefined}
          statusVariant='warning'
          icon={ClipboardCheck}
        />
        <DashboardCard
          title="O'QILMAGAN"
          value={loadingUnread ? '–' : String(unreadData?.unread_count ?? 0)}
          status={(unreadData?.unread_count ?? 0) > 0 ? 'Yangi' : undefined}
          statusVariant='info'
          icon={MessageSquare}
        />
      </div>

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-5'>
        <SectionCard className='lg:col-span-3'>
          <div className='mb-5 flex items-center justify-between'>
            <h2 className='text-base font-bold text-slate-800 dark:text-slate-100'>
              Kutilayotgan topshiriqlar
            </h2>
            <LinkBtn
              onClick={() => navigate({ to: '/teacher-dashboard/homework' })}
            >
              Barchasi
            </LinkBtn>
          </div>

          {loadingAssignments ? (
            <div className='flex items-center justify-center gap-2 py-10 text-sm text-slate-400'>
              <Loader2 size={16} className='animate-spin' /> Yuklanmoqda...
            </div>
          ) : pendingAssignments.length === 0 ? (
            <div className='py-10 text-center text-slate-500'>
              Hozircha topshiriqlar yo'q
            </div>
          ) : (
            <div className='divide-y divide-slate-100 dark:divide-slate-800'>
              {pendingAssignments.slice(0, 4).map((a) => (
                <AssignmentRow key={a.id} a={a} now={now} />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard className='lg:col-span-2'>
          <div className='mb-5 flex items-center justify-between'>
            <h2 className='text-base font-bold text-slate-800 dark:text-slate-100'>
              Dars jadvali
            </h2>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button className='flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[#b80035] hover:bg-rose-50 dark:text-rose-400'>
                  <CalendarDays size={14} />
                  {calendarDate
                    ? calendarDate.toLocaleDateString('uz-UZ', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'Sana'}
                </button>
              </PopoverTrigger>
              <PopoverContent className='w-auto border-0 p-0' align='end'>
                <Calendar
                  mode='single'
                  selected={calendarDate}
                  onSelect={(d) => {
                    setCalendarDate(d ?? calendarDate)
                    setCalendarOpen(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {loadingSchedule ? (
            <div className='flex items-center justify-center gap-2 py-10 text-sm text-slate-400'>
              <Loader2 size={16} className='animate-spin' /> Yuklanmoqda...
            </div>
          ) : scheduleItems.length === 0 ? (
            <div className='py-10 text-center text-slate-500'>Darslar yo'q</div>
          ) : (
            <div className='space-y-1'>
              {scheduleItems.map((item, i) => (
                <div
                  key={item.id}
                  className='flex gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                >
                  <div
                    className={`mt-1 h-full w-0.5 rounded-full ${['bg-[#b80035]', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500'][i % 5]}`}
                  />
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs font-semibold text-slate-400'>
                      {formatTimeRange(item.start_time, item.end_time)}
                    </p>
                    <p className='mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-100'>
                      {item.name}
                    </p>
                    <p className='mt-0.5 truncate text-xs text-slate-400'>
                      {item.course_name} · {item.student_count} talaba
                    </p>
                  </div>
                  <span className='mt-0.5 text-[10px] font-semibold text-slate-400'>
                    {item.lesson_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  )
}
