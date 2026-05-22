import { useMemo, useRef, useState } from 'react'
import { Calendar, CheckCircle, Clock, Paperclip, UploadCloud, AlertCircle } from 'lucide-react'
import { useStudentHomework, useSubmitHomework } from '@/hooks/student/useStudentPortal'
import { uploadAssignmentFile } from '@/services/assignment.service'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StudentPageHeader } from '@/components/student/common/student-page-header'
import { cn } from '@/lib/utils'
import type { Assignment } from '@/types/assignment.types'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

// ✅ FIX 1: Topshirilgan vazifalar ID larini sessionStorage da saqlash
// Sahifa yangilansa ham, boshqa vazifaga o'tib qaytilsa ham holat saqlanadi
const SUBMITTED_KEY = 'hw_submitted_ids'

function getSubmittedIds(): Record<number, string> {
  try {
    const raw = sessionStorage.getItem(SUBMITTED_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function markAsSubmitted(id: number, submittedAt: string) {
  const current = getSubmittedIds()
  current[id] = submittedAt
  sessionStorage.setItem(SUBMITTED_KEY, JSON.stringify(current))
}

export default function StudentHomeworkPage() {
  const { data: assignments = [], isLoading } = useStudentHomework()
  const [activeId, setActiveId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const submitMutation = useSubmitHomework()
  const [now] = useState(() => Date.now())

  // ✅ FIX 2: sessionStorage dan o'qib, component state bilan birlashtirish
  const [localSubmitted, setLocalSubmitted] = useState<Record<number, string>>(
    () => getSubmittedIds()
  )

  const effectiveActiveId = activeId ?? assignments[0]?.id ?? null
  const activeAssignment = useMemo(
    () => assignments.find((a) => a.id === effectiveActiveId) ?? null,
    [effectiveActiveId, assignments]
  )

  // ✅ FIX 3: Topshirilganligini tekshirishda local + server ma'lumotlarini birlashtirish
  const isSubmitted = (assignment: Assignment): boolean => {
    // 1. Local (sessionStorage) da bor?
    if (localSubmitted[assignment.id]) return true
    // 2. Server dan kelgan ma'lumotda bor?
    if (assignment.is_submitted) return true
    if ((assignment as any).status === 'topshirgan') return true
    if ((assignment as any).status === 'submitted') return true
    if (assignment.submitted_at) return true
    return false
  }

  const getSubmittedAt = (assignment: Assignment): string => {
    return localSubmitted[assignment.id] || assignment.submitted_at || ''
  }

  const getStatus = (assignment: Assignment): 'Pending' | 'Submitted' | 'Late' => {
    if (isSubmitted(assignment)) return 'Submitted'
    const isPastDue = new Date(assignment.deadline).getTime() < now
    return isPastDue ? 'Late' : 'Pending'
  }

  const statusBadge = (status: 'Pending' | 'Submitted' | 'Late') => {
    if (status === 'Submitted')
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    if (status === 'Late')
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
  }

  const getStatusLabel = (status: 'Pending' | 'Submitted' | 'Late') => {
    if (status === 'Submitted') return 'Topshirilgan'
    if (status === 'Late') return 'Kechikkan'
    return 'Kutilmoqda'
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('uz-UZ', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const maxFileSize = 5 * 1024 * 1024
      if (file.size > maxFileSize) {
        toast.error('Fayl hajmi 5MB dan oshmasligi kerak!')
        event.target.value = ''
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async () => {
    if (!activeAssignment) return

    // ✅ FIX 4: Yuborishdan OLDIN tekshirish - 400 error bo'lishidan oldin to'xtatish
    if (isSubmitted(activeAssignment)) {
      toast.info('Bu vazifa allaqachon topshirilgan!')
      return
    }

    // ✅ FIX 5: Mutation yuborilayotganda ikkinchi marta bosishni bloklash
    if (submitMutation.isPending) return

    if (activeAssignment.submission_type === 'file' && !selectedFile) {
      toast.error('Iltimos, topshirish uchun fayl biriktiring.')
      return
    }

    if (activeAssignment.submission_type === 'text' && !textAnswer.trim()) {
      toast.error('Iltimos, topshirishdan oldin javobingizni yozing.')
      return
    }

    try {
      const submitForm = new FormData()
      submitForm.append('assignment', String(activeAssignment.id))

      if (activeAssignment.submission_type === 'file' && selectedFile) {
        const uploadResponse = await uploadAssignmentFile(selectedFile)
        submitForm.append('file_path', uploadResponse.file_path)
        if (textAnswer.trim()) submitForm.append('text_answer', textAnswer.trim())
      } else {
        submitForm.append('text_answer', textAnswer.trim())
      }

      const response = await submitMutation.mutateAsync({
        id: activeAssignment.id,
        payload: submitForm,
      })

      const submittedAt = response?.submitted_at || new Date().toISOString()

      // ✅ FIX 6: Muvaffaqiyatdan keyin DARHOL ikki joyda saqlash
      markAsSubmitted(activeAssignment.id, submittedAt)        // sessionStorage
      setLocalSubmitted((prev) => ({                           // React state
        ...prev,
        [activeAssignment.id]: submittedAt,
      }))

      toast.success('Vazifa muvaffaqiyatli topshirildi!')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setTextAnswer('')
    } catch (error: any) {
      // ✅ FIX 7: 400 kelsa "allaqachon topshirilgan" sifatida ko'rsatish
      const status = error?.response?.status ?? error?.status
      if (status === 400) {
        const submittedAt = new Date().toISOString()
        markAsSubmitted(activeAssignment.id, submittedAt)
        setLocalSubmitted((prev) => ({ ...prev, [activeAssignment.id]: submittedAt }))
        toast.info('Bu vazifa allaqachon topshirilgan!')
      } else {
        toast.error(error?.message || 'Vazifani topshirishda xatolik yuz berdi.')
      }
    }
  }

  return (
    <div className='mx-auto max-w-7xl space-y-4 select-none'>
      <StudentPageHeader
        title='Uyga vazifalar'
        description="O'quv jarayoningizni kuzatib boring va topshiriqlarni yakunlang."
      />

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr] h-[calc(100vh-14.5rem)] w-full overflow-hidden items-start'>

        {/* CHAP: Topshiriqlar markazi */}
        <Card className='shadow-sm flex flex-col border-primary/40 h-full overflow-hidden max-h-full shrink-0'>
          <CardHeader className='pb-3 shrink-0 border-b border-slate-100 dark:border-slate-800/60'>
            <div>
              <CardTitle className='text-sm font-bold'>Topshiriqlar markazi</CardTitle>
              <p className='text-[11px] text-muted-foreground mt-0.5 leading-tight'>
                Tafsilotlarni ko'rish va topshirish uchun vazifani tanlang.
              </p>
            </div>
          </CardHeader>

          <CardContent className='p-2 flex-1 overflow-y-auto custom-chat-sidebar h-[calc(100%-80px)]'>
            <div className='space-y-2'>
              {isLoading && (
                <div className='space-y-2'>
                  <Skeleton className='h-[92px] w-full rounded-xl' />
                  <Skeleton className='h-[92px] w-full rounded-xl' />
                  <Skeleton className='h-[92px] w-full rounded-xl' />
                </div>
              )}
              {!isLoading && assignments.length === 0 && (
                <div className='p-8 text-center text-xs font-medium text-muted-foreground'>
                  Vazifalar topilmadi.
                </div>
              )}
              {!isLoading &&
                assignments.map((item) => {
                  const isActive = item.id === (activeAssignment?.id ?? null)
                  const status = getStatus(item)

                  return (
                    <button
                      key={item.id}
                      type='button'
                      onClick={() => {
                        setActiveId(item.id)
                        setSelectedFile(null)
                        setTextAnswer('')
                      }}
                      className={cn(
                        'w-full rounded-xl border bg-card px-3 py-2 text-left transition flex flex-col justify-between shrink-0 box-border',
                        'hover:bg-primary/5 hover:border-primary/60',
                        isActive
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                          : 'border-primary/20'
                      )}
                    >
                      <div className='flex items-start justify-between gap-2 w-full min-w-0'>
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-xs font-bold text-foreground'>{item.title}</p>
                          <p className='truncate text-[11px] text-muted-foreground mt-0.5'>
                            Guruh: {item.group}
                          </p>
                        </div>
                        <Badge
                          variant='outline'
                          className={cn(
                            'rounded-full text-[10px] px-2 py-0 shrink-0 font-bold',
                            statusBadge(status)
                          )}
                        >
                          {getStatusLabel(status)}
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between gap-2 w-full text-[10px] text-muted-foreground mt-1 shrink-0'>
                        <div className='flex items-center gap-1 min-w-0 max-w-[55%]'>
                          <Calendar className='size-3 shrink-0' />
                          <span className='truncate'>
                            Muddati: {formatDate(item.deadline).split(',')[0]}
                          </span>
                        </div>
                        <div className='flex items-center gap-1 shrink-0'>
                          <Clock className='size-3 shrink-0' />
                          <span>Maks: {item.max_score}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* O'NG: Detallar va topshirish */}
        <Card className='shadow-sm border-primary/40 h-full flex flex-col overflow-hidden max-h-full'>
          {isLoading ? (
            <CardContent className='flex h-full items-center justify-center'>
              <div className='flex flex-col items-center gap-3'>
                <Skeleton className='h-6 w-48 rounded-lg' />
                <Skeleton className='h-4 w-32 rounded-lg' />
              </div>
            </CardContent>
          ) : activeAssignment ? (
            <>
              <CardHeader className='pb-3 shrink-0 border-b border-slate-100 dark:border-slate-800/60'>
                <div className='flex flex-col gap-3'>
                  <div className='min-w-0'>
                    <p className='text-[10px] font-bold tracking-wide text-muted-foreground uppercase'>
                      GURUH: {activeAssignment.group}
                    </p>
                    <CardTitle className='mt-1 text-xl font-extrabold leading-tight truncate text-foreground'>
                      {activeAssignment.title}
                    </CardTitle>
                    <div className='mt-2 flex flex-wrap items-center gap-1.5'>
                      <Badge
                        variant='outline'
                        className={cn(
                          'rounded-full text-[10px] font-bold',
                          statusBadge(getStatus(activeAssignment))
                        )}
                      >
                        {getStatusLabel(getStatus(activeAssignment))}
                      </Badge>
                      <Badge
                        variant='outline'
                        className='rounded-full text-[10px] font-medium bg-primary/5 text-primary border-primary/20'
                      >
                        Muddati: {formatDate(activeAssignment.deadline)}
                      </Badge>
                      <Badge
                        variant='outline'
                        className='rounded-full text-[10px] font-medium bg-primary/5 text-primary border-primary/20'
                      >
                        Maks. ball: {activeAssignment.max_score}
                      </Badge>
                      <Badge
                        variant='outline'
                        className='rounded-full text-[10px] font-medium bg-primary/10 text-primary border-primary/20'
                      >
                        Format:{' '}
                        {activeAssignment.submission_type === 'file'
                          ? 'Fayl yuklash'
                          : 'Matnli javob'}
                      </Badge>
                    </div>
                  </div>

                  <div className='flex w-full items-center gap-2 rounded-xl border border-primary/20 bg-card px-3 py-1.5 md:w-fit'>
                    <Avatar className='size-7 shrink-0'>
                      <AvatarFallback className='bg-primary/10 text-primary text-xs font-bold'>
                        {activeAssignment.created_by?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='leading-tight min-w-0'>
                      <p className='text-[10px] font-bold text-muted-foreground'>Ustoz</p>
                      <p className='truncate text-xs font-bold text-foreground'>
                        {activeAssignment.created_by || "Noma'lum"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='flex-1 overflow-y-auto p-4 custom-chat-sidebar h-[calc(100%-160px)]'>
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px] items-start'>

                  {/* Chap: Tavsif */}
                  <div className='space-y-4 min-w-0 w-full'>
                    <div className='prose prose-sm dark:prose-invert max-w-none'>
                      <h3 className='text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider'>
                        Vazifa tavsifi
                      </h3>
                      <div className='text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap rounded-xl border border-primary/20 bg-slate-50/50 dark:bg-transparent p-3.5'>
                        {activeAssignment.description || 'Tavsif berilmagan.'}
                      </div>
                    </div>

                    {activeAssignment.attachment && (
                      <div className='rounded-xl border border-primary/20 bg-card p-2.5'>
                        <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                          Biriktirilgan materiallar
                        </h4>
                        <div className='mt-2'>
                          <a
                            href={activeAssignment.attachment}
                            target='_blank'
                            rel='noreferrer'
                            className='flex items-center gap-2.5 p-2 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors w-full min-w-0'
                          >
                            <div className='bg-primary/10 p-1.5 rounded-md text-primary shrink-0'>
                              <Paperclip className='size-3.5' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='text-xs font-bold truncate text-foreground'>
                                Faylni ko'rish
                              </p>
                            </div>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* O'ng: Topshirish portali */}
                  <div className='space-y-3 w-full shrink-0'>
                    <div className='rounded-xl border border-primary/20 bg-card p-3.5'>
                      <h3 className='text-xs font-bold text-foreground mb-3 uppercase tracking-wider'>
                        Topshirish portali
                      </h3>

                      {/* ✅ isSubmitted() funksiyasi orqali tekshirish */}
                      {isSubmitted(activeAssignment) ? (
                        <div className='flex flex-col items-center justify-center py-6 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30'>
                          <div className='w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2 shrink-0'>
                            <CheckCircle className='w-5 h-5' />
                          </div>
                          <p className='font-bold text-sm'>Siz bu vazifani topshirgansiz ✅</p>
                          <p className='text-[11px] mt-1 text-emerald-600/80 dark:text-emerald-400/80 font-medium'>
                            Tez orada ustozingiz vazifani ko'rib chiqadi.
                          </p>
                          {getSubmittedAt(activeAssignment) && (
                            <p className='text-[10px] mt-2 text-muted-foreground bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full border border-emerald-100/50'>
                              Topshirildi: {formatDate(getSubmittedAt(activeAssignment))}
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          {activeAssignment.submission_type === 'file' && (
                            <>
                              <input
                                ref={fileInputRef}
                                type='file'
                                className='hidden'
                                onChange={handleFileChange}
                              />
                              <button
                                type='button'
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                  'w-full rounded-xl border-2 border-dashed border-primary/30 bg-muted/20 p-4 text-center transition group',
                                  'hover:bg-primary/5 hover:border-primary/50 focus-visible:outline-none'
                                )}
                              >
                                <div className='bg-background rounded-full w-9 h-9 flex items-center justify-center mx-auto mb-2 shadow-xs border border-primary/20 group-hover:scale-105 transition-transform shrink-0'>
                                  <UploadCloud className='size-4 text-primary' />
                                </div>
                                <p className='text-xs font-bold text-foreground'>
                                  {selectedFile ? 'Faylni almashtirish' : 'Faylni tanlash'}
                                </p>
                                {selectedFile ? (
                                  <p className='mt-1 truncate text-[10px] font-bold text-primary bg-primary/10 py-0.5 px-2 rounded-md inline-block max-w-full'>
                                    {selectedFile.name}
                                  </p>
                                ) : (
                                  <p className='mt-0.5 text-[10px] text-muted-foreground'>
                                    Maksimal hajm: 5MB
                                  </p>
                                )}
                              </button>
                            </>
                          )}

                          <div className='mt-3 space-y-1.5'>
                            <label
                              htmlFor='submission-comment'
                              className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'
                            >
                              {activeAssignment.submission_type === 'text'
                                ? 'Sizning javobingiz'
                                : 'Izoh (ixtiyoriy)'}
                            </label>
                            <textarea
                              id='submission-comment'
                              rows={activeAssignment.submission_type === 'text' ? 5 : 3}
                              value={textAnswer}
                              onChange={(e) => setTextAnswer(e.target.value)}
                              placeholder={
                                activeAssignment.submission_type === 'text'
                                  ? 'Javobingizni shu yerga yozing...'
                                  : 'Ustoz uchun izoh qoldiring...'
                              }
                              className='w-full resize-none rounded-xl border border-primary/20 bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/50'
                            />
                          </div>

                          <Button
                            className='mt-3 h-9 w-full rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 disabled:opacity-60'
                            onClick={handleSubmit}
                            disabled={submitMutation.isPending}
                          >
                            {submitMutation.isPending ? 'Topshirilmoqda...' : 'Vazifani topshirish'}
                          </Button>
                        </>
                      )}
                    </div>

                    {getStatus(activeAssignment) === 'Late' && (
                      <div className='flex gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-400 text-[11px] items-start border border-amber-200 dark:border-amber-900/30'>
                        <AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
                        <p className='leading-normal font-medium'>
                          Topshirish muddati o'tgan. Kechikkan deb belgilanadi.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className='flex h-full items-center justify-center text-muted-foreground text-xs font-medium'>
              Vazifa tanlanmagan.
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}