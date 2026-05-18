import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { Assignment } from '@/types/assignment.types'
import { BookOpen, Plus, PencilLine, Trash2, Eye, Check, Loader2, Download, FileText, Image, Paperclip, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useDeleteAssignment, useGetAssignments, useGetAssignmentStatus } from '@/hooks/useAssignments'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { RoseButton } from '@/components/ui/rose-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ListPagination } from '@/components/list-pagination'
import { AssignTaskModal } from '@/components/teacher/modals/AssignTaskModal'

// --- 1. YORDAMCHI FUNKSIYALAR VA TIPLAR ---
interface AssignmentStatus {
  student_id: number; username: string; full_name: string;
  status: 'topshirgan' | 'topshirmagan';
  submitted_at: string | null; score: number | null;
  text_answer: string | null; file_answer: string | null;
}

const formatDate = (val: string | null) => {
  if (!val) return '—'
  const d = new Date(val)
  return isNaN(d.getTime()) ? val : d.toLocaleString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getStatus = (item: Assignment) => (item.is_active ?? new Date(item.deadline).getTime() >= Date.now()) ? 'active' : 'completed'

// File helpers to resolve absolute API URLs and identify file details
const getFileUrl = (url: string | null) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
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

// --- 2. BATAFSIL MA'LUMOT MODALI (Alohida komponent) ---
function AssignmentDetailsModal({ open, onOpenChange, assignment, data, loading }: any) {
  const [tab, setTab] = useState<'topshirgan' | 'topshirmagan'>('topshirgan')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  if (!assignment) return null
  const submitted = data?.filter((x: any) => x.status === 'topshirgan') || []
  const notSubmitted = data?.filter((x: any) => x.status === 'topshirmagan') || []
  const total = data?.length || 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-3xl rounded-2xl border-none bg-white p-6 shadow-2xl dark:bg-slate-900'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold dark:text-white'>
              {assignment.title} <span className='text-sm text-gray-500'>(Guruh ID: {assignment.group})</span>
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className='flex justify-center py-10'><Loader2 className='animate-spin text-gray-500' /></div>
          ) : !data ? (
            <p className='text-center py-8 text-gray-500'>Ma'lumot topilmadi</p>
          ) : (
            <div className='space-y-5'>
              {/* Statistika */}
              <div className='grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 p-5 dark:bg-slate-800'>
                <div className='text-center'><p className='text-xs text-gray-500'>Jami</p><p className='text-2xl font-bold'>{total}</p></div>
                <div className='text-center text-emerald-600'><p className='text-xs'>Topshirgan</p><p className='text-2xl font-bold'>{submitted.length}</p></div>
                <div className='text-center text-rose-600'><p className='text-xs'>Topshirmagan</p><p className='text-2xl font-bold'>{notSubmitted.length}</p></div>
              </div>

              {/* Ro'yxat (Tabs) */}
              {total > 0 && (
                <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                  <TabsList className='w-full bg-gray-100 p-1 dark:bg-slate-800'>
                    <TabsTrigger value='topshirgan' className='flex-1'>Topshirgan ({submitted.length})</TabsTrigger>
                    <TabsTrigger value='topshirmagan' className='flex-1'>Topshirmagan ({notSubmitted.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value='topshirgan' className='max-h-[50vh] overflow-auto space-y-3 mt-4'>
                    {submitted.map((s: AssignmentStatus) => (
                      <div key={s.student_id} className='p-4 rounded-xl border bg-emerald-50/50 dark:bg-slate-800 dark:border-slate-700'>
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <p className='font-bold dark:text-white'>{s.full_name || s.username}</p>
                            <p className='text-xs text-gray-500'>ID: {s.student_id} • Topshirdi: {formatDate(s.submitted_at)}</p>
                          </div>
                          <span className='text-emerald-600 font-bold'>Ball: {s.score ?? '—'}</span>
                        </div>
                        {s.text_answer && (
                          <div className='mb-2'>
                            <p className='text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Yozma javob:</p>
                            <p className='text-sm bg-white p-2.5 rounded-xl border dark:bg-slate-700 dark:border-none dark:text-slate-200'>{s.text_answer}</p>
                          </div>
                        )}
                        {s.file_answer && (
                          <div className='mt-3'>
                            <p className='text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Topshirilgan fayl:</p>
                            <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800'>
                              <div className='flex items-center gap-3 min-w-0 flex-1'>
                                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-slate-900 dark:text-emerald-400'>
                                  {getFileIcon(s.file_answer)}
                                </div>
                                <div className='min-w-0 flex-1'>
                                  <p className='truncate text-xs font-bold text-gray-700 dark:text-slate-200'>
                                    {getFileName(s.file_answer)}
                                  </p>
                                  <p className='text-[10px] text-gray-400 uppercase font-semibold'>
                                    {getFileExtension(s.file_answer)} format
                                  </p>
                                </div>
                              </div>
                              <div className='flex items-center gap-2 shrink-0'>
                                <button
                                  type='button'
                                  onClick={() => setPreviewUrl(s.file_answer)}
                                  className='flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 text-xs font-semibold transition-all'
                                >
                                  <Eye size={14} /> Ko'rish
                                </button>
                                <a
                                  href={getFileUrl(s.file_answer)}
                                  download
                                  target='_blank'
                                  rel='noreferrer'
                                  className='flex items-center gap-1 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold transition-all'
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

                  <TabsContent value='topshirmagan' className='max-h-[50vh] overflow-auto space-y-3 mt-4'>
                    {notSubmitted.map((s: AssignmentStatus) => (
                      <div key={s.student_id} className='p-4 rounded-xl border bg-rose-50/50 dark:bg-slate-800 dark:border-slate-700'>
                        <p className='font-bold dark:text-white'>{s.full_name || s.username}</p>
                        <p className='text-xs text-gray-500'>ID: {s.student_id}</p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full File Answer Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={(isOpen) => !isOpen && setPreviewUrl(null)}>
        <DialogContent className='max-w-4xl rounded-2xl border-none bg-white p-6 shadow-2xl dark:bg-slate-900 [&>button.absolute]:text-slate-400 dark:[&>button.absolute]:text-slate-500'>
          <DialogHeader className='flex flex-row items-center justify-between border-b pb-3 mb-4 dark:border-slate-800'>
            <DialogTitle className='text-lg font-bold dark:text-white truncate max-w-[70%]'>
              {previewUrl ? getFileName(previewUrl) : 'Fayl ko\'rish'}
            </DialogTitle>
            {previewUrl && (
              <a
                href={getFileUrl(previewUrl)}
                target='_blank'
                rel='noreferrer'
                className='flex items-center gap-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 px-3 py-1.5 text-xs font-semibold mr-8 transition-all'
              >
                <ExternalLink size={14} /> Yangi oynada ochish
              </a>
            )}
          </DialogHeader>

          <div className='flex justify-center items-center bg-gray-50 dark:bg-slate-950 p-4 rounded-xl min-h-[50vh] max-h-[70vh] overflow-auto border dark:border-slate-800'>
            {previewUrl && (
              ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(getFileExtension(previewUrl)) ? (
                <img
                  src={getFileUrl(previewUrl)}
                  alt='File Preview'
                  className='max-w-full max-h-[65vh] object-contain rounded-lg shadow-sm'
                />
              ) : getFileExtension(previewUrl) === 'pdf' ? (
                <iframe
                  src={getFileUrl(previewUrl)}
                  className='w-full h-[65vh] rounded-lg border-none'
                  title='PDF Preview'
                />
              ) : (
                <div className='text-center py-10'>
                  <div className='flex justify-center mb-4 text-emerald-600 dark:text-emerald-400'>
                    {getFileIcon(previewUrl)}
                  </div>
                  <p className='text-sm font-semibold dark:text-white'>{getFileName(previewUrl)}</p>
                  <p className='text-xs text-gray-500 mt-1 dark:text-gray-400'>Ushbu fayl turini brauzerda to'g'ridan-to'g'ri ko'rib bo'lmaydi.</p>
                  <a
                    href={getFileUrl(previewUrl)}
                    download
                    className='inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-semibold mt-4 transition-all'
                  >
                    <Download size={16} /> Yuklab olish
                  </a>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
// --- 3. HOMEWORK CARD (Alohida komponent) ---
function HomeworkCard({ hw, onEdit, onDelete, onOpenDetails, loadingId }: any) {
  const status = getStatus(hw)
  
  return (
    <div className='rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
      <div className='mb-4 flex items-start justify-between'>
        <div className='rounded-xl bg-rose-50 p-3 text-rose-600 dark:bg-rose-950/50'><BookOpen size={24} /></div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
          {status === 'active' ? 'Faol' : 'Tugatilgan'}
        </span>
      </div>
      
      <h3 className='text-lg font-bold dark:text-white'>{hw.title}</h3>
      <p className='text-sm text-gray-500'>Guruh ID: {hw.group}</p>
      
      <div className='mt-4 grid grid-cols-2 gap-2 text-sm'>
        <div className='rounded-xl bg-gray-50 p-2 dark:bg-slate-800'>
          <p className='text-[11px] text-gray-400'>Muddat</p>
          <p className='font-medium dark:text-white'>{formatDate(hw.deadline)}</p>
        </div>
        <div className='rounded-xl bg-gray-50 p-2 dark:bg-slate-800'>
          <p className='text-[11px] text-gray-400'>Maks ball</p>
          <p className='font-medium dark:text-white'>{hw.max_score}</p>
        </div>
      </div>

      <div className='mt-5 flex gap-2'>
        <RoseButton roseVariant='outline' className='flex-1 h-10' onClick={() => onEdit(hw)}><PencilLine size={16} /> Tahrirlash</RoseButton>
        <RoseButton roseVariant='outline' className='flex-1 h-10' onClick={() => onOpenDetails(hw)} disabled={loadingId === hw.id}>
          {loadingId === hw.id ? <Loader2 size={16} className='animate-spin' /> : <Eye size={16} />} Batafsil
        </RoseButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <RoseButton roseVariant='outline' className='h-10 text-red-600 border-red-200 hover:bg-red-50'><Trash2 size={16} /></RoseButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent><DropdownMenuItem className='text-red-600' onClick={() => onDelete(hw.id)}><Check size={16} className='mr-2'/> O'chirishni tasdiqlash</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// --- 4. ASOSIY SAHIFA KOMPONENTI ---
export const Route = createFileRoute('/_authenticated/teacher-dashboard/homework')({
  component: HomeworkPage,
})

function HomeworkPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const { data: assignments, isLoading } = useGetAssignments({ page, page_size: pageSize })
  const deleteMutation = useDeleteAssignment()

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsAssignment, setDetailsAssignment] = useState<Assignment | null>(null)

  const { data: detailsData, isLoading: detailsLoading } = useGetAssignmentStatus(detailsAssignment?.id ?? null)

  const filteredAssignments = useMemo(() => 
    (assignments ?? []).filter(hw => filter === 'all' || getStatus(hw) === filter),
  [assignments, filter])

  const handleDelete = async (id: number) => {
    try { await deleteMutation.mutateAsync(id); toast.success("O'chirildi") } 
    catch { toast.error("Xatolik yuz berdi") }
  }

  const handleOpenDetails = (item: Assignment) => {
    setDetailsAssignment(item); 
    setDetailsOpen(true);
  }

  return (
    <div>
      <div className='mb-6 flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold dark:text-white'>Homework</h1>
          <p className='text-gray-500'>Vazifalarni boshqarish</p>
        </div>
        <RoseButton onClick={() => { setEditingAssignment(null); setModalOpen(true); }}><Plus size={18} className='mr-2' /> Yangi vazifa</RoseButton>
      </div>

      <div className='mb-6 flex gap-2'>
        {['all', 'active', 'completed'].map((f) => (
          <button key={f} onClick={() => setFilter(f as any)} 
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${filter === f ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400'}`}>
            {f === 'all' ? 'Barchasi' : f === 'active' ? 'Faol' : 'Tugatilgan'}
          </button>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {isLoading ? <p className='text-gray-500'>Yuklanmoqda...</p> : 
         filteredAssignments.length === 0 ? <p className='text-gray-500'>Topshiriqlar yo'q</p> : 
         filteredAssignments.map(hw => (
          <HomeworkCard key={hw.id} hw={hw} onEdit={(h: any) => { setEditingAssignment(h); setModalOpen(true) }} onDelete={handleDelete} onOpenDetails={handleOpenDetails} loadingId={detailsLoading && detailsAssignment?.id === hw.id ? hw.id : null} />
        ))}
      </div>

      {assignments && assignments.length > 0 && (
        <div className='mt-6'>
          <ListPagination page={page} pageSize={pageSize} totalCount={assignments.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} />
        </div>
      )}

      <AssignTaskModal open={modalOpen} onOpenChange={setModalOpen} editingAssignment={editingAssignment} />
      <AssignmentDetailsModal open={detailsOpen} onOpenChange={setDetailsOpen} assignment={detailsAssignment} data={detailsData} loading={detailsLoading} />
    </div>
  )
}