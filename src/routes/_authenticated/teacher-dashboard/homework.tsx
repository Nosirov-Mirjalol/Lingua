import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { Assignment } from '@/types/assignment.types'
import {
  BookOpen,
  Plus,
  PencilLine,
  Trash2,
  Eye,
  Check,
  Loader2,
  Download,
  FileText,
  Image,
  Paperclip,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useDeleteAssignment,
  useGetAssignments,
  useGetAssignmentStatus,
} from '@/hooks/useAssignments'
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
import { ListPagination } from '@/components/list-pagination'

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

const formatDate = (val: string | null) => {
  if (!val) return '—'
  const d = new Date(val)
  return isNaN(d.getTime())
    ? val
    : d.toLocaleString('uz-UZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
}

const getStatus = (item: Assignment) =>
  (item.is_active ?? new Date(item.deadline).getTime() >= Date.now())
    ? 'active'
    : 'completed'

const getFileUrl = (url: string | null) => {
  if (!url) return ''
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  return `${cleanBase}${cleanUrl}`
}

const getFileName = (url: string | null) => {
  if (!url) return 'Fayl'
  const decoded = decodeURIComponent(url)
  return decoded.substring(decoded.lastIndexOf('/') + 1) || 'Fayl'
}

const getFileExtension = (url: string | null) => {
  if (!url) return ''
  const name = getFileName(url)
  return name.substring(name.lastIndexOf('.') + 1).toLowerCase()
}

const getFileIcon = (url: string | null) => {
  const ext = getFileExtension(url)
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return <Image size={18} />
  }
  if (ext === 'pdf') {
    return <FileText size={18} />
  }
  return <Paperclip size={18} />
}

function AssignmentDetailsModal({
  open,
  onOpenChange,
  assignment,
  data,
  loading,
}: any) {
  const [tab, setTab] = useState<'topshirgan' | 'topshirmagan'>('topshirgan')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  if (!assignment) return null
  const submitted = data?.filter((x: any) => x.status === 'topshirgan') || []
  const notSubmitted =
    data?.filter((x: any) => x.status === 'topshirmagan') || []
  const total = data?.length || 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-3xl rounded-2xl border-none bg-white p-6 shadow-2xl dark:bg-slate-900'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold dark:text-white'>
              {assignment.title}{' '}
              <span className='text-sm text-gray-500'>
                (Guruh ID: {assignment.group})
              </span>
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className='flex justify-center py-10'>
              <Loader2 className='animate-spin text-gray-500' />
            </div>
          ) : !data ? (
            <p className='py-8 text-center text-gray-500'>Ma'lumot topilmadi</p>
          ) : (
            <div className='space-y-5'>
              <div className='grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 p-5 dark:bg-slate-800'>
                <div className='text-center'>
                  <p className='text-xs text-gray-500'>Jami</p>
                  <p className='text-2xl font-bold'>{total}</p>
                </div>
                <div className='text-center text-emerald-600'>
                  <p className='text-xs'>Topshirgan</p>
                  <p className='text-2xl font-bold'>{submitted.length}</p>
                </div>
                <div className='text-center text-rose-600'>
                  <p className='text-xs'>Topshirmagan</p>
                  <p className='text-2xl font-bold'>{notSubmitted.length}</p>
                </div>
              </div>

              {total > 0 && (
                <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                  <TabsList className='w-full bg-gray-100 p-1 dark:bg-slate-800'>
                    <TabsTrigger value='topshirgan' className='flex-1'>
                      Topshirgan ({submitted.length})
                    </TabsTrigger>
                    <TabsTrigger value='topshirmagan' className='flex-1'>
                      Topshirmagan ({notSubmitted.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value='topshirgan'
                    className='mt-4 max-h-[50vh] space-y-3 overflow-auto'
                  >
                    {submitted.map((s: AssignmentStatus) => (
                      <div
                        key={s.student_id}
                        className='rounded-xl border bg-emerald-50/50 p-4 dark:border-slate-700 dark:bg-slate-800'
                      >
                        <div className='mb-2 flex items-start justify-between'>
                          <div>
                            <p className='font-bold dark:text-white'>
                              {s.full_name || s.username}
                            </p>
                            <p className='text-xs text-gray-500'>
                              ID: {s.student_id} • Topshirdi:{' '}
                              {formatDate(s.submitted_at)}
                            </p>
                          </div>
                          <span className='font-bold text-emerald-600'>
                            Ball: {s.score ?? '—'}
                          </span>
                        </div>
                        {s.text_answer && (
                          <div className='mb-2'>
                            <p className='mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase'>
                              Yozma javob:
                            </p>
                            <p className='rounded-xl border bg-white p-2.5 text-sm dark:border-none dark:bg-slate-700 dark:text-slate-200'>
                              {s.text_answer}
                            </p>
                          </div>
                        )}
                        {s.file_answer && (
                          <div className='mt-3'>
                            <p className='mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase'>
                              Topshirilgan fayl:
                            </p>
                            <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800'>
                              <div className='flex min-w-0 flex-1 items-center gap-3'>
                                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-slate-900 dark:text-emerald-400'>
                                  {getFileIcon(s.file_answer)}
                                </div>
                                <div className='min-w-0 flex-1'>
                                  <p className='truncate text-xs font-bold text-gray-700 dark:text-slate-200'>
                                    {getFileName(s.file_answer)}
                                  </p>
                                  <p className='text-[10px] font-semibold text-gray-400 uppercase'>
                                    {getFileExtension(s.file_answer)} format
                                  </p>
                                </div>
                              </div>
                              <div className='flex shrink-0 items-center gap-2'>
                                <button
                                  type='button'
                                  onClick={() => setPreviewUrl(s.file_answer)}
                                  className='flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                                >
                                  <Eye size={14} /> Ko'rish
                                </button>
                                <a
                                  href={getFileUrl(s.file_answer)}
                                  download
                                  target='_blank'
                                  rel='noreferrer'
                                  className='flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold transition-all hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                                >
                                  <Download size={14} /> Yuklab olish
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent
                    value='topshirmagan'
                    className='mt-4 max-h-[50vh] space-y-3 overflow-auto'
                  >
                    {notSubmitted.map((s: AssignmentStatus) => (
                      <div
                        key={s.student_id}
                        className='rounded-xl border bg-rose-50/50 p-4 dark:border-slate-700 dark:bg-slate-800'
                      >
                        <p className='font-bold dark:text-white'>
                          {s.full_name || s.username}
                        </p>
                        <p className='text-xs text-gray-500'>
                          ID: {s.student_id}
                        </p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!previewUrl}
        onOpenChange={(isOpen) => !isOpen && setPreviewUrl(null)}
      >
        <DialogContent className='max-w-4xl rounded-2xl border-none bg-white p-6 shadow-2xl dark:bg-slate-900 [&>button.absolute]:text-slate-400 dark:[&>button.absolute]:text-slate-500'>
          <DialogHeader className='mb-4 flex flex-row items-center justify-between border-b pb-3 dark:border-slate-800'>
            <DialogTitle className='max-w-[70%] truncate text-lg font-bold dark:text-white'>
              {previewUrl ? getFileName(previewUrl) : "Fayl ko'rish"}
            </DialogTitle>
            {previewUrl && (
              <a
                href={getFileUrl(previewUrl)}
                target='_blank'
                rel='noreferrer'
                className='mr-8 flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              >
                <ExternalLink size={14} /> Yangi oynada ochish
              </a>
            )}
          </DialogHeader>

          <div className='flex max-h-[70vh] min-h-[50vh] items-center justify-center overflow-auto rounded-xl border bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950'>
            {previewUrl &&
              (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(
                getFileExtension(previewUrl)
              ) ? (
                <img
                  src={getFileUrl(previewUrl)}
                  alt='File Preview'
                  className='max-h-[65vh] max-w-full rounded-lg object-contain shadow-sm'
                />
              ) : getFileExtension(previewUrl) === 'pdf' ? (
                <iframe
                  src={getFileUrl(previewUrl)}
                  className='h-[65vh] w-full rounded-lg border-none'
                  title='PDF Preview'
                />
              ) : (
                <div className='py-10 text-center'>
                  <div className='mb-4 flex justify-center text-emerald-600 dark:text-emerald-400'>
                    {getFileIcon(previewUrl)}
                  </div>
                  <p className='text-sm font-semibold dark:text-white'>
                    {getFileName(previewUrl)}
                  </p>
                  <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                    Ushbu fayl turini brauzerda to'g'ridan-to'g'ri ko'rib
                    bo'lmaydi.
                  </p>
                  <a
                    href={getFileUrl(previewUrl)}
                    download
                    className='mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-rose-700'
                  >
                    <Download size={16} /> Yuklab olish
                  </a>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function HomeworkCard({ hw, onEdit, onDelete, onOpenDetails, loadingId }: any) {
  const status = getStatus(hw)

  return (
    <div className='rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
      <div className='mb-4 flex items-start justify-between'>
        <div className='rounded-xl bg-rose-50 p-3 text-rose-600 dark:bg-rose-950/50'>
          <BookOpen size={24} />
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}
        >
          {status === 'active' ? 'Faol' : 'Tugatilgan'}
        </span>
      </div>

      <h3 className='text-lg font-bold dark:text-white'>{hw.title}</h3>
      <p className='text-sm text-gray-500'>Guruh ID: {hw.group}</p>

      <div className='mt-4 grid grid-cols-2 gap-2 text-sm'>
        <div className='rounded-xl bg-gray-50 p-2 dark:bg-slate-800'>
          <p className='text-[11px] text-gray-400'>Muddat</p>
          <p className='font-medium dark:text-white'>
            {formatDate(hw.deadline)}
          </p>
        </div>
        <div className='rounded-xl bg-gray-50 p-2 dark:bg-slate-800'>
          <p className='text-[11px] text-gray-400'>Maks ball</p>
          <p className='font-medium dark:text-white'>{hw.max_score}</p>
        </div>
      </div>

      <div className='mt-5 flex gap-2'>
        <RoseButton
          roseVariant='outline'
          className='h-10 flex-1'
          onClick={() => onEdit(hw)}
        >
          <PencilLine size={16} /> Tahrirlash
        </RoseButton>
        <RoseButton
          roseVariant='outline'
          className='h-10 flex-1'
          onClick={() => onOpenDetails(hw)}
          disabled={loadingId === hw.id}
        >
          {loadingId === hw.id ? (
            <Loader2 size={16} className='animate-spin' />
          ) : (
            <Eye size={16} />
          )}{' '}
          Batafsil
        </RoseButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <RoseButton
              roseVariant='outline'
              className='h-10 border-red-200 text-red-600 hover:bg-red-50'
            >
              <Trash2 size={16} />
            </RoseButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className='text-red-600'
              onClick={() => onDelete(hw.id)}
            >
              <Check size={16} className='mr-2' /> O'chirishni tasdiqlash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
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
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: assignments, isLoading } = useGetAssignments({
    page,
    page_size: pageSize,
  })
  const deleteMutation = useDeleteAssignment()

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsAssignment, setDetailsAssignment] = useState<Assignment | null>(
    null
  )

  const { data: detailsData, isLoading: detailsLoading } =
    useGetAssignmentStatus(detailsAssignment?.id ?? null)

  const filteredAssignments = useMemo(
    () =>
      (assignments ?? []).filter(
        (hw) => filter === 'all' || getStatus(hw) === filter
      ),
    [assignments, filter]
  )

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("O'chirildi")
    } catch {
      toast.error('Xatolik yuz berdi')
    }
  }

  const handleOpenDetails = (item: Assignment) => {
    setDetailsAssignment(item)
    setDetailsOpen(true)
  }

  return (
    <div>
      <div className='mb-6 py-5 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800 dark:text-white md:text-3xl'>
            Homework
          </h1>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400 md:mt-2 md:text-base'>
            Create and manage homework assignments
          </p>
        </div>
        <RoseButton
          onClick={() => {
            setEditingAssignment(null)
            setModalOpen(true)
          }}
        >
          <Plus size={18} className='mr-2' /> Yangi vazifa
        </RoseButton>
      </div>

      <div className='mb-6 flex gap-2'>
        {['all', 'active', 'completed'].map((f) => {
          const isActive = filter === f

          return (
            <RoseButton
              key={f}
              onClick={() => setFilter(f as any)}
              roseVariant={isActive ? 'solid' : 'ghost'}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                isActive
                  ? ''
                  : 'text-slate-600 hover:bg-rose-50/50 dark:text-slate-400 dark:hover:bg-rose-950/30'
              }`}
            >
              {f === 'all'
                ? 'Barchasi'
                : f === 'active'
                  ? 'Faol'
                  : 'Tugatilgan'}
            </RoseButton>
          )
        })}
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {isLoading ? (
          <p className='text-gray-500'>Yuklanmoqda...</p>
        ) : filteredAssignments.length === 0 ? (
          <p className='text-gray-500'>Topshiriqlar yo'q</p>
        ) : (
          filteredAssignments.map((hw) => (
            <HomeworkCard
              key={hw.id}
              hw={hw}
              onEdit={(h: any) => {
                setEditingAssignment(h)
                setModalOpen(true)
              }}
              onDelete={handleDelete}
              onOpenDetails={handleOpenDetails}
              loadingId={
                detailsLoading && detailsAssignment?.id === hw.id ? hw.id : null
              }
            />
          ))
        )}
      </div>

      {assignments && assignments.length > 0 && (
        <div className='mt-6'>
          <ListPagination
            page={page}
            pageSize={pageSize}
            totalCount={assignments.length}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s)
              setPage(1)
            }}
          />
        </div>
      )}

      <AssignTaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingAssignment={editingAssignment}
      />
      <AssignmentDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        assignment={detailsAssignment}
        data={detailsData}
        loading={detailsLoading}
      />
    </div>
  )
}
