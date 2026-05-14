import { useState, useMemo, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { Assignment } from '@/types/assignment.types'
import {
  BookOpen,
  Plus,
  ChevronDown,
  PencilLine,
  Trash2,
  Eye,
  Check,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDeleteAssignment, useGetAssignments } from '@/hooks/useAssignments'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RoseButton } from '@/components/ui/rose-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AssignTaskModal } from '@/components/teacher/modals/AssignTaskModal'
import { GroupDetailsModal } from '@/components/teacher/modals/GroupDetailsModal'

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

const formatSubmittedAt = (value: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`
}

export const Route = createFileRoute(
  '/_authenticated/teacher-dashboard/homework'
)({
  component: HomeworkPage,
})

function HomeworkPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  )
  const [groupDetailsOpen, setGroupDetailsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const { data: assignments, isLoading } = useGetAssignments()
  const deleteMutation = useDeleteAssignment()

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsAssignment, setDetailsAssignment] = useState<Assignment | null>(
    null
  )
  const [detailsLoadingId, setDetailsLoadingId] = useState<number | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsTab, setDetailsTab] = useState<'topshirgan' | 'topshirmagan'>(
    'topshirgan'
  )
  const [detailsData, setDetailsData] = useState<AssignmentStatus[] | null>(
    null
  )

  const formatDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatus = useMemo(
    () =>
      (item: Assignment): 'active' | 'completed' => {
        // Use is_active from API response, fallback to deadline check
        const now = Date.now()
        return item.is_active !== undefined
          ? item.is_active
            ? 'active'
            : 'completed'
          : new Date(item.deadline).getTime() >= now
            ? 'active'
            : 'completed'
      },
    []
  )

  const getProgressWidth = useCallback(
    (item: Assignment) => {
      const status = getStatus(item)
      if (status === 'completed') return '100%'

      const now = Date.now()
      const deadline = new Date(item.deadline).getTime()
      const timeRemaining = deadline - now
      const weekInMs = 7 * 24 * 60 * 60 * 1000

      if (timeRemaining <= 0) return '100%'

      const progress = Math.max(
        Math.min((timeRemaining / weekInMs) * 100, 10),
        10
      )

      return `${Math.min(progress, 100)}%`
    },
    [getStatus]
  )

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Topshiriq o'chirildi")
    } catch {
      toast.error("Topshiriqni o'chirishda xatolik yuz berdi")
    }
  }

  const handleEdit = (item: Assignment) => {
    setEditingAssignment(item)
    setModalOpen(true)
  }

  const handleOpenDetails = async (item: Assignment) => {
    if (detailsLoadingId === item.id) return
    setDetailsAssignment(item)
    setDetailsData(null)
    setDetailsTab('topshirgan')
    setDetailsOpen(true)
    setDetailsLoadingId(item.id)
    setDetailsLoading(true)

    try {
      const data = await fetchAssignmentStatus(item.id)
      setDetailsData(data)
    } catch {
      toast.error('Topshiriq holatini yuklashda xatolik yuz berdi')
      setDetailsOpen(false)
    } finally {
      setDetailsLoading(false)
      setDetailsLoadingId((current) => (current === item.id ? null : current))
    }
  }

  const filteredAssignments = useMemo(
    () =>
      (assignments ?? []).filter((hw) => {
        const status = getStatus(hw)
        if (filter === 'active') return status === 'active'
        if (filter === 'completed') return status === 'completed'
        return true
      }),
    [assignments, filter, getStatus]
  )

  return (
    <div>
      <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center md:mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800 dark:text-white md:text-3xl'>
            Homework
          </h1>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400 md:mt-2 md:text-base'>
            Create and manage homework assignments
          </p>
        </div>
        <RoseButton
          onClick={() => setModalOpen(true)}
          className='flex w-full items-center justify-center gap-2 sm:w-auto'
        >
          <Plus size={18} />
          Yangi vazifa
        </RoseButton>
      </div>

      <AssignTaskModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) {
            setEditingAssignment(null)
          }
        }}
        editingAssignment={editingAssignment}
      />
      <GroupDetailsModal
        open={groupDetailsOpen}
        onOpenChange={setGroupDetailsOpen}
      />

      <Dialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open)
          if (!open) {
            setDetailsAssignment(null)
            setDetailsData(null)
            setDetailsLoading(false)
            setDetailsLoadingId(null)
          }
        }}
      >
        <DialogContent className='max-w-3xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-[0_30px_60px_-15px_rgba(25,28,30,0.20)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-none'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold text-gray-800 dark:text-white'>
              {detailsAssignment?.title ?? 'Topshiriq'}
              {detailsAssignment ? (
                <span className='ms-2 text-sm font-semibold text-gray-500 dark:text-gray-400'>
                  (Guruh ID: {detailsAssignment.group})
                </span>
              ) : null}
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className='flex items-center justify-center gap-2 py-10 text-sm text-gray-600 dark:text-gray-400'>
              <Loader2 size={18} className='animate-spin' />
              Yuklanmoqda...
            </div>
          ) : detailsData ? (
            (() => {
              const total = detailsData.length
              const submitted = detailsData.filter(
                (x) => x.status === 'topshirgan'
              ).length
              const pct = total ? Math.round((submitted / total) * 100) : 0
              const submittedList = detailsData.filter(
                (x) => x.status === 'topshirgan'
              )
              const notSubmittedList = detailsData.filter(
                (x) => x.status === 'topshirmagan'
              )

              return (
                <div className='space-y-5'>
                  <div className='rounded-2xl bg-gray-50 dark:bg-slate-800/50 p-4'>
                    <div className='flex items-center justify-between gap-3'>
                      <p className='text-sm font-semibold text-gray-800 dark:text-white'>
                        {submitted} / {total} talaba topshirdi
                      </p>
                      <p className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
                        {pct}%
                      </p>
                    </div>
                    <div className='mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700'>
                      <div
                        className='h-full bg-[#b80035]'
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {total === 0 ? (
                    <p className='py-8 text-center text-sm text-gray-500'>
                      Hali hech kim topshirmagan
                    </p>
                  ) : (
                    <Tabs
                      value={detailsTab}
                      onValueChange={(v) =>
                        setDetailsTab(v as 'topshirgan' | 'topshirmagan')
                      }
                    >
                      <TabsList className='w-full rounded-2xl bg-gray-50 dark:bg-slate-800 p-1'>
                        <TabsTrigger value='topshirgan' className='flex-1 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white'>
                          Topshirgan ({submittedList.length})
                        </TabsTrigger>
                        <TabsTrigger value='topshirmagan' className='flex-1 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white'>
                          Topshirmagan ({notSubmittedList.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value='topshirgan'>
                        {submittedList.length === 0 ? (
                          <p className='py-8 text-center text-sm text-gray-500'>
                            Hali hech kim topshirmagan
                          </p>
                        ) : (
                          <div className='max-h-[50vh] space-y-2 overflow-auto pr-1'>
                            {submittedList.map((s) => (
                              <div
                                key={s.student_id}
                                className='rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-[0_18px_35px_-14px_rgba(25,28,30,0.10)] dark:shadow-none'
                              >
                                <div className='flex items-start justify-between gap-3'>
                                  <div className='min-w-0'>
                                    <p className='truncate text-sm font-bold text-gray-800 dark:text-white'>
                                      {s.full_name || s.username}
                                    </p>
                                    <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                                      Submitted:{' '}
                                      {formatSubmittedAt(s.submitted_at)}
                                    </p>
                                  </div>
                                  <span className='shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400'>
                                    Topshirgan
                                  </span>
                                </div>
                                <div className='mt-3 grid grid-cols-2 gap-2 text-sm'>
                                  <div className='rounded-xl bg-gray-50 dark:bg-slate-700/50 px-3 py-2'>
                                    <p className='text-[11px] font-semibold tracking-wide text-gray-400 dark:text-slate-500 uppercase'>
                                      Ball
                                    </p>
                                    <p className='mt-1 font-semibold text-gray-800 dark:text-white'>
                                      {s.score ?? '—'}
                                    </p>
                                  </div>
                                  <div className='rounded-xl bg-gray-50 dark:bg-slate-700/50 px-3 py-2'>
                                    <p className='text-[11px] font-semibold tracking-wide text-gray-400 dark:text-slate-500 uppercase'>
                                      Javob
                                    </p>
                                    <p className='mt-1 truncate font-semibold text-gray-800 dark:text-white'>
                                      {s.text_answer || s.file_answer
                                        ? 'Mavjud'
                                        : '—'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value='topshirmagan'>
                        {notSubmittedList.length === 0 ? (
                          <p className='py-8 text-center text-sm text-gray-500'>
                            Hamma topshirgan
                          </p>
                        ) : (
                          <div className='max-h-[50vh] space-y-2 overflow-auto pr-1'>
                            {notSubmittedList.map((s) => (
                              <div
                                key={s.student_id}
                                className='rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-[0_18px_35px_-14px_rgba(25,28,30,0.10)] dark:shadow-none'
                              >
                                <div className='flex items-start justify-between gap-3'>
                                  <div className='min-w-0'>
                                    <p className='truncate text-sm font-bold text-gray-800 dark:text-white'>
                                      {s.full_name || s.username}
                                    </p>
                                    <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                                      Submitted: —
                                    </p>
                                  </div>
                                  <span className='shrink-0 rounded-full bg-rose-100 dark:bg-rose-950 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400'>
                                    Topshirmagan
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              )
            })()
          ) : (
            <p className='py-8 text-center text-sm text-gray-500'>
              Holat topilmadi
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className='mb-6 flex flex-wrap items-center gap-2 md:gap-4'>
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-[#fff0f3] dark:bg-rose-950/50 text-[#b80035] dark:text-rose-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          Barchasi
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            filter === 'active'
              ? 'bg-[#fff0f3] dark:bg-rose-950/50 text-[#b80035] dark:text-rose-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          Faol
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            filter === 'completed'
              ? 'bg-[#fff0f3] dark:bg-rose-950/50 text-[#b80035] dark:text-rose-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          Tugatilgan
        </button>
      </div>

      {/* Homework Cards */}
      <div className='grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2'>
        {isLoading ? (
          <div className='rounded-2xl bg-white dark:bg-slate-900 p-6 text-sm text-gray-500 dark:text-gray-400 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)] dark:shadow-none'>
            Topshiriqlar yuklanmoqda...
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className='rounded-2xl bg-white dark:bg-slate-900 p-6 text-sm text-gray-500 dark:text-gray-400 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)] dark:shadow-none'>
            Hozircha topshiriqlar mavjud emas.
          </div>
        ) : (
          filteredAssignments.map((hw) => {
            const status = getStatus(hw)
            return (
              <div
                key={hw.id}
                className='rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)] dark:shadow-none border border-transparent dark:border-slate-800'
              >
                <div className='mb-4 flex items-start justify-between'>
                  <div className='rounded-xl bg-[#fff0f3] dark:bg-rose-950/50 p-3 text-[#b80035] dark:text-rose-400'>
                    <BookOpen size={24} />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      status === 'active'
                        ? 'bg-green-100 dark:bg-emerald-950 text-green-700 dark:text-emerald-400'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-400'
                    }`}
                  >
                    {status === 'active' ? 'Faol' : 'Tugatilgan'}
                  </span>
                </div>
                <h3 className='text-lg font-bold text-gray-800 dark:text-white'>{hw.title}</h3>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  Guruh ID: {hw.group}
                </p>
                <div className='mt-4 grid grid-cols-2 gap-2 text-sm'>
                  <div
                    className={`rounded-xl px-3 py-2 ${
                      status === 'completed' ? 'bg-red-50 dark:bg-rose-950/20' : 'bg-gray-50 dark:bg-slate-800/50'
                    }`}
                  >
                    <p className='text-[11px] font-semibold tracking-wide text-gray-400 dark:text-slate-500 uppercase'>
                      Muddat
                    </p>
                    <p
                      className={`mt-1 font-medium ${
                        status === 'completed'
                          ? 'text-red-700 dark:text-rose-400'
                          : 'text-gray-700 dark:text-slate-200'
                      }`}
                    >
                      {formatDate(hw.deadline)}
                    </p>
                    {status === 'completed' && (
                      <p className='mt-1 text-xs text-red-600 dark:text-rose-500'>
                        Deadline o'tgan
                      </p>
                    )}
                  </div>
                  <div className='rounded-xl bg-gray-50 dark:bg-slate-800/50 px-3 py-2'>
                    <p className='text-[11px] font-semibold tracking-wide text-gray-400 dark:text-slate-500 uppercase'>
                      Maks ball
                    </p>
                    <p className='mt-1 font-medium text-gray-700 dark:text-slate-200'>
                      Maks ball: {hw.max_score}
                    </p>
                  </div>
                </div>
                <div className='mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700'>
                  <div
                    className='h-full bg-[#b80035]'
                    style={{
                      width: getProgressWidth(hw),
                    }}
                  />
                </div>
                <div className='mt-5 flex flex-wrap items-center gap-2'>
                  <RoseButton
                    roseVariant='outline'
                    className='h-10 rounded-xl border-gray-300 dark:border-slate-700 px-3 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    onClick={() => handleEdit(hw)}
                  >
                    <PencilLine size={16} />
                    Tahrirlash
                  </RoseButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <RoseButton
                        roseVariant='outline'
                        className='h-10 rounded-xl border-red-200 dark:border-rose-900/50 px-3 text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/30'
                      >
                        <Trash2 size={16} />
                        O&apos;chirish
                        <ChevronDown size={15} />
                      </RoseButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='start'
                      className='w-52 rounded-xl p-1'
                    >
                      <DropdownMenuItem
                        variant='destructive'
                        className='rounded-lg'
                        onClick={() => handleDelete(hw.id)}
                      >
                        <Check size={16} />
                        O&apos;chirishni tasdiqlash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <RoseButton
                    roseVariant='outline'
                    className='h-10 rounded-xl border-gray-300 dark:border-slate-700 px-3 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    onClick={() => handleOpenDetails(hw)}
                    disabled={detailsLoadingId === hw.id}
                  >
                    {detailsLoadingId === hw.id ? (
                      <Loader2 size={16} className='animate-spin' />
                    ) : (
                      <Eye size={16} />
                    )}
                    Batafsil
                  </RoseButton>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
