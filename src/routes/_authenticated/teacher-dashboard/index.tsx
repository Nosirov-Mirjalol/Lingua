import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Users,
  ClipboardCheck,
  MessageSquare,
  ChevronRight,
  Loader,
  Eye,
  Loader2,
} from 'lucide-react'
import { useTeacherGroups } from '@/hooks/teacher/groups/useTeacherGroups'
import { useProfile } from '@/hooks/teacher/profile/useProfile'
import { useGetAssignments } from '@/hooks/useAssignments'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useUnreadCount } from '@/features/notifications/hooks'

// ─── Utils ────────────────────────────────────────────────────────────────────

const formatClock = (v?: string) => {
  const p = v?.split(':')
  return p && p.length >= 2
    ? `${p[0].padStart(2, '0')}:${p[1].padStart(2, '0')}`
    : null
}

const formatTimeRange = (start?: string, end?: string) =>
  [formatClock(start), formatClock(end)].filter(Boolean).join(' - ')

const formatRelativeDate = (dateString: string, now: number) => {
  const date = new Date(dateString)
  const diffDays = Math.ceil((date.getTime() - now) / 86_400_000)
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const time = `${hh}:${mm}`
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
  return `${date.getDate()} ${months[date.getMonth()]} ${time}`
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

// ─── Components ───────────────────────────────────────────────────────────────

const StatCard = ({
  icon,
  value,
  label,
  badge,
}: {
  icon: React.ReactNode
  value: string
  label: string
  badge?: React.ReactNode
}) => (
  <div className='group rounded-2xl bg-white p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)] transition-all duration-300 hover:shadow-[0_25px_50px_-10px_rgba(184,0,53,0.1)]'>
    <div className='flex items-start justify-between'>
      <div className='rounded-xl bg-[#fff0f3] p-3 text-[#b80035] transition-transform duration-300 group-hover:scale-110'>
        {icon}
      </div>
      {badge && <div className='shrink-0 animate-pulse'>{badge}</div>}
    </div>
    <p className='mt-4 text-3xl font-bold text-gray-800'>{value}</p>
    <p className='mt-1 text-sm text-gray-500'>{label}</p>
  </div>
)

const LinkBtn = ({
  onClick,
  loading = false,
  variant = 'primary',
  children,
}: {
  onClick: () => void
  loading?: boolean
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`flex items-center gap-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
      variant === 'primary'
        ? 'text-sm font-semibold text-[#b80035] hover:underline'
        : 'rounded-lg px-4 py-2 text-sm font-semibold text-[#b80035] hover:bg-[#fff0f3] active:bg-[#ffe6ec]'
    }`}
  >
    {loading ? (
      <>
        <Loader size={16} className='animate-spin' /> Loading...
      </>
    ) : (
      <>
        {children}
        {variant === 'primary' && <ChevronRight size={16} />}
      </>
    )}
  </button>
)

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/_authenticated/teacher-dashboard/')({
  component: DashboardPage,
})

interface AssignmentStatus {
  student_id: number
  username: string
  full_name: string
  status: 'topshirgan' | 'topshirmagan'
  submitted_at: string | null
  score: number | null
  text_answer: string | null
  file_answer: string | null
}

const fetchAssignmentStatus = async (assignmentId: number) => {
  const token = localStorage.getItem('access_token')
  const res = await fetch(
    `http://185.190.143.64:8000/api/assignments/${assignmentId}/status/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch assignment status (${res.status})`)
  }

  return (await res.json()) as AssignmentStatus[]
}

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

  const [statusOpenId, setStatusOpenId] = useState<number | null>(null)
  const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null)
  const [statusByAssignmentId, setStatusByAssignmentId] = useState<
    Record<number, AssignmentStatus[]>
  >({})

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  // ─── Derived ───────────────────────────────────────────────────────────────

  const groupIds = new Set(groups.map((g) => g.id))

  const pendingAssignments = assignments.filter(
    (a) =>
      groupIds.has(a.group) &&
      new Date(a.deadline).getTime() > now &&
      a.is_active
  )

  const scheduleItems = groups
    .slice(0, 4)
    .map((g) => ({
      time: formatTimeRange(g.start_time, g.end_time),
      title: g.name,
      detail: `${g.students.length} talaba • Guruh ID: ${g.id}`,
    }))
    .filter((x) => x.time)

  const activeGroupsCount = groups.filter((g) => g.status === 'active').length
  const studentsCount = new Set(
    groups.flatMap((g) => g.students.map((s) => s.student))
  ).size
  const unreadCount = unreadData?.unread_count ?? 0

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Welcome */}
      <div className='mb-6 md:mb-8'>
        <h1 className='text-2xl font-bold text-gray-800 md:text-3xl'>
          Welcome back,{' '}
          <span className='text-[#b80035]'>
            {profile?.full_name || profile?.username || 'teacher'}
          </span>
          .
        </h1>
        <p className='mt-2 text-gray-500'>
          Here's what's happening with your classes today.
        </p>
      </div>

      {/* Stats */}
      <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-8 md:gap-5 lg:grid-cols-4'>
        <StatCard
          icon={<Users size={24} />}
          value={loadingGroups ? '...' : String(activeGroupsCount)}
          label='Active Groups'
        />
        <StatCard
          icon={<Users size={24} />}
          value={loadingGroups ? '...' : String(studentsCount)}
          label='Students'
        />
        <StatCard
          icon={<ClipboardCheck size={24} />}
          value={loadingAssignments ? '...' : String(pendingAssignments.length)}
          label='Tasks Pending'
          badge={
            pendingAssignments.length > 0 && (
              <span className='rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-600'>
                Active
              </span>
            )
          }
        />
        <StatCard
          icon={<MessageSquare size={24} />}
          value={loadingUnread ? '...' : String(unreadCount)}
          label='Unread Msg'
          badge={
            unreadCount > 0 && (
              <span className='relative flex h-3 w-3'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75' />
                <span className='relative inline-flex h-3 w-3 rounded-full bg-red-500' />
              </span>
            )
          }
        />
      </div>

      {/* Main */}
      <div className='mb-6 grid grid-cols-1 gap-6 md:mb-8 lg:grid-cols-5'>
        {/* Assignments */}
        <div className='col-span-1 rounded-2xl bg-white p-4 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)] md:p-6 lg:col-span-3'>
          <div className='mb-6 flex items-center justify-between'>
            <h2 className='text-lg font-bold text-gray-800'>
              Pending Assignments
            </h2>
            <LinkBtn
              onClick={() => navigate({ to: '/teacher-dashboard/homework' })}
            >
              View All
            </LinkBtn>
          </div>

          {loadingAssignments ? (
            <p className='py-8 text-center text-sm text-gray-500'>
              Yuklanmoqda...
            </p>
          ) : pendingAssignments.length === 0 ? (
            <p className='py-8 text-center text-sm text-gray-500'>
              Hozircha pending topshiriqlar yo'q
            </p>
          ) : (
            pendingAssignments.slice(0, 3).map((a) => {
              const daysLeft = Math.ceil(
                (new Date(a.deadline).getTime() - now) / 86_400_000
              )
              const statusColor =
                daysLeft <= 1
                  ? 'bg-red-100 text-red-700'
                  : daysLeft <= 3
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'

              const statusData = statusByAssignmentId[a.id]
              const total = statusData?.length ?? 0
              const submitted = statusData
                ? statusData.filter((x) => x.status === 'topshirgan').length
                : 0
              const pct = total ? Math.round((submitted / total) * 100) : 0

              const handleOpenStatus = async () => {
                setStatusOpenId(a.id)
                if (statusByAssignmentId[a.id]) return
                setStatusLoadingId(a.id)
                try {
                  const data = await fetchAssignmentStatus(a.id)
                  setStatusByAssignmentId((prev) => ({ ...prev, [a.id]: data }))
                } finally {
                  setStatusLoadingId((current) =>
                    current === a.id ? null : current
                  )
                }
              }

              return (
                <div
                  key={a.id}
                  className='flex flex-col items-start justify-between gap-3 border-b border-gray-100 py-4 last:border-0 sm:flex-row sm:items-center sm:gap-4'
                >
                  <div className='flex w-full items-center gap-4 sm:w-auto'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white'>
                      {getInitials(a.title)}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate font-semibold text-gray-800'>
                        {a.title}
                      </p>
                      <p className='truncate text-xs text-gray-500'>
                        Guruh ID: {a.group} • Muddat:{' '}
                        {formatRelativeDate(a.deadline, now)}
                      </p>
                    </div>
                  </div>
                  <div className='flex w-full items-center justify-between gap-4 pl-14 sm:w-auto sm:justify-end sm:pl-0'>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
                    >
                      {daysLeft} kun qoldi
                    </span>

                    <Popover
                      open={statusOpenId === a.id}
                      onOpenChange={(open) =>
                        setStatusOpenId(open ? a.id : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <button
                          type='button'
                          onClick={handleOpenStatus}
                          className='inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#b80035] hover:bg-[#fff0f3] active:bg-[#ffe6ec] disabled:opacity-50'
                          disabled={statusLoadingId === a.id}
                          aria-label='Holati'
                        >
                          {statusLoadingId === a.id ? (
                            <Loader2 size={16} className='animate-spin' />
                          ) : (
                            <Eye size={16} />
                          )}
                          Holati
                          {statusData ? (
                            <span className='text-xs font-semibold text-gray-500'>
                              {submitted}/{total} topshirgan
                            </span>
                          ) : null}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align='end'
                        className='w-64 rounded-2xl bg-white p-4 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.12)]'
                      >
                        {statusLoadingId === a.id ? (
                          <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <Loader2 size={16} className='animate-spin' />
                            Yuklanmoqda...
                          </div>
                        ) : statusData ? (
                          <div className='space-y-3'>
                            <div>
                              <p className='text-sm font-bold text-gray-800'>
                                Topshirish holati
                              </p>
                              <p className='mt-1 text-xs text-gray-500'>
                                Jami talabalar: {total}
                              </p>
                            </div>

                            <div className='grid grid-cols-2 gap-2 text-sm'>
                              <div className='rounded-xl bg-emerald-50 px-3 py-2'>
                                <p className='text-xs font-semibold text-emerald-700'>
                                  Topshirgan
                                </p>
                                <p className='mt-1 text-base font-bold text-emerald-700'>
                                  {submitted}
                                </p>
                              </div>
                              <div className='rounded-xl bg-rose-50 px-3 py-2'>
                                <p className='text-xs font-semibold text-rose-700'>
                                  Topshirmagan
                                </p>
                                <p className='mt-1 text-base font-bold text-rose-700'>
                                  {total - submitted}
                                </p>
                              </div>
                            </div>

                            <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                              <div
                                className='h-full bg-[#b80035]'
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className='text-xs text-gray-500'>
                              {submitted} / {total} talaba topshirdi
                            </p>
                          </div>
                        ) : (
                          <p className='text-sm text-gray-600'>
                            Holat topilmadi
                          </p>
                        )}
                      </PopoverContent>
                    </Popover>

                    {/* homework.$assignmentId.tsx mavjud bo'lsa params ishlatish mumkin,
                        hozir faqat homework.tsx bor — search param orqali filter qilamiz */}
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
            })
          )}
        </div>

        {/* Schedule */}
        <div className='col-span-1 rounded-2xl bg-white p-4 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)] md:p-6 lg:col-span-2'>
          <div className='mb-6 flex items-center justify-between'>
            <h2 className='text-lg font-bold text-gray-800'>Class Schedule</h2>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <span>
                  <LinkBtn onClick={() => setCalendarOpen((v) => !v)}>
                    View Calendar
                  </LinkBtn>
                </span>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='end'>
                <Calendar
                  mode='single'
                  selected={calendarDate}
                  onSelect={(d) => setCalendarDate(d ?? calendarDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {loadingGroups ? (
            <p className='py-8 text-center text-sm text-gray-500'>
              Yuklanmoqda...
            </p>
          ) : scheduleItems.length === 0 ? (
            <p className='py-8 text-center text-sm text-gray-500'>
              Bugun darslar yo'q
            </p>
          ) : (
            scheduleItems.map((item, i) => (
              <div key={i} className='flex gap-4 py-3'>
                <div className='w-1 rounded-full bg-[#b80035]' />
                <div className='flex-1'>
                  <p className='text-sm font-semibold text-gray-800'>
                    {item.time}
                  </p>
                  <p className='mt-1 text-base font-medium text-gray-800'>
                    {item.title}
                  </p>
                  <p className='mt-1 text-sm text-gray-500'>{item.detail}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
