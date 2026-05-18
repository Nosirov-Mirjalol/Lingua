import { useMemo, useRef, useState, useEffect } from 'react'
import { Calendar, Clock, Paperclip, UploadCloud, AlertCircle } from 'lucide-react'
import { useStudentHomework, useSubmitHomework } from '@/hooks/student/useStudentPortal'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StudentPageHeader } from '@/components/student/common/student-page-header'
import { cn } from '@/lib/utils'
import { Assignment } from '@/types/assignment.types'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function StudentHomeworkPage() {
  const { data: assignments = [], isLoading } = useStudentHomework()
  const [activeId, setActiveId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const submitMutation = useSubmitHomework()

  // Auto-select first assignment when loaded
  useEffect(() => {
    if (assignments.length > 0 && activeId === null) {
      setActiveId(assignments[0].id)
    }
  }, [assignments, activeId])

  const activeAssignment = useMemo(
    () => assignments.find((assignment) => assignment.id === activeId) ?? assignments[0] ?? null,
    [activeId, assignments]
  )

  const getStatus = (assignment: Assignment): 'Pending' | 'Submitted' | 'Late' => {
    if (!assignment.is_active) return 'Submitted'
    const isPastDue = new Date(assignment.deadline).getTime() < Date.now()
    return isPastDue ? 'Late' : 'Pending'
  }

  const statusBadge = (status: 'Pending' | 'Submitted' | 'Late') => {
    if (status === 'Submitted') {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    }
    if (status === 'Late') {
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
    }

    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const maxFileSize = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxFileSize) {
        toast.error('Fayl hajmi 5MB dan oshmasligi kerak!');
        event.target.value = '';
        return;
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = () => {
    if (!activeAssignment) return

    if (activeAssignment.submission_type === 'file' && !selectedFile) {
      toast.error('Please attach a file for your submission.')
      return
    }

    if (activeAssignment.submission_type === 'text' && !textAnswer.trim()) {
      toast.error('Please write your answer before submitting.')
      return
    }

    let payload: any

    if (selectedFile) {
      const formData = new FormData()
      formData.append('assignment', String(activeAssignment.id))
      // Backend may require text_answer even if empty
      formData.append('text_answer', textAnswer || 'Biriktirilgan fayl') 
      formData.append('file_answer', selectedFile)
      payload = formData
    } else {
      payload = {
        assignment: activeAssignment.id,
        text_answer: textAnswer.trim() ? textAnswer : 'Javob matni yo\'q'
      }
    }

    submitMutation.mutate({ id: activeAssignment.id, payload }, {
      onSuccess: () => {
        toast.success('Homework submitted successfully!')
        setSelectedFile(null)
        setTextAnswer('')
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to submit homework.')
      }
    })
  }

  return (
    <div className='-mx-4 md:-mx-8'>
      <div className='px-4 md:px-8'>
        <StudentPageHeader
          title='Vazifalar'
          description='Keep track of your language milestones and assignments.'
        />

        <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]'>
          <Card className='shadow-sm flex flex-col'>
            <CardHeader className='pb-2 shrink-0'>
              <div>
                <CardTitle className='text-base'>Assignment Hub</CardTitle>
                <p className='text-xs text-muted-foreground'>
                  Pick a task to see details and submit.
                </p>
              </div>
            </CardHeader>
            <CardContent className='p-0 flex-1 min-h-0'>
              <ScrollArea className='h-[calc(100svh-220px)]'>
                <div className='space-y-2 p-2 pt-0'>
                  {isLoading && (
                    <div className="space-y-3 p-2">
                      <Skeleton className="h-24 w-full rounded-2xl" />
                      <Skeleton className="h-24 w-full rounded-2xl" />
                      <Skeleton className="h-24 w-full rounded-2xl" />
                    </div>
                  )}
                  {!isLoading && assignments.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No assignments found.
                    </div>
                  )}
                  {!isLoading && assignments.map((item) => {
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
                          'w-full rounded-2xl border bg-card px-3 py-2.5 text-left transition',
                          'hover:bg-accent hover:text-accent-foreground hover:shadow-sm',
                          isActive ? 'border-primary ring-2 ring-primary/20 bg-accent/50' : 'border-border'
                        )}
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-semibold text-foreground'>
                              {item.title}
                            </p>
                            <p className='truncate text-xs text-muted-foreground'>
                              Group {item.group}
                            </p>
                          </div>
                          <Badge
                            variant='outline'
                            className={cn('rounded-full', statusBadge(status))}
                          >
                            {status}
                          </Badge>
                        </div>

                        <div className='mt-3 flex items-center justify-between gap-3'>
                          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                            <Calendar className='size-3.5' />
                            <span>Due {formatDate(item.deadline)}</span>
                          </div>
                          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                            <Clock className='size-3.5' />
                            <span>Max Score: {item.max_score}</span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className='shadow-sm'>
            {isLoading ? (
              <CardContent className='flex h-[400px] items-center justify-center'>
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </CardContent>
            ) : activeAssignment ? (
              <>
                <CardHeader className='pb-3'>
                  <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                    <div className='min-w-0'>
                      <p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                        GROUP {activeAssignment.group}
                      </p>
                      <CardTitle className='mt-2 text-2xl leading-tight'>
                        {activeAssignment.title}
                      </CardTitle>
                      <div className='mt-3 flex flex-wrap items-center gap-2'>
                        <Badge
                          variant='outline'
                          className={cn('rounded-full', statusBadge(getStatus(activeAssignment)))}
                        >
                          {getStatus(activeAssignment)}
                        </Badge>
                        <Badge
                          variant='outline'
                          className='rounded-full bg-muted text-muted-foreground'
                        >
                          Due {formatDate(activeAssignment.deadline)}
                        </Badge>
                        <Badge
                          variant='outline'
                          className='rounded-full bg-muted text-muted-foreground'
                        >
                          Max score: {activeAssignment.max_score}
                        </Badge>
                        <Badge
                          variant='outline'
                          className='rounded-full bg-primary/10 text-primary border-primary/20'
                        >
                          Format: {activeAssignment.submission_type === 'file' ? 'File Upload' : 'Text Answer'}
                        </Badge>
                      </div>
                    </div>

                    <div className='flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shrink-0'>
                      <Avatar className='size-10'>
                        <AvatarFallback className='bg-primary/10 text-primary'>
                          {activeAssignment.created_by?.charAt(0).toUpperCase() || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='leading-tight'>
                        <p className='text-xs font-semibold text-muted-foreground'>Teacher</p>
                        <p className='text-sm font-semibold text-foreground'>{activeAssignment.created_by || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]'>
                    <div className='space-y-6'>
                      <div className='prose prose-sm dark:prose-invert max-w-none'>
                        <h3 className='text-sm font-semibold text-foreground mb-2'>
                          Task Description
                        </h3>
                        <div className='text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap rounded-2xl border bg-card p-4'>
                          {activeAssignment.description || 'No description provided.'}
                        </div>
                      </div>

                      {activeAssignment.attachment && (
                        <div className='rounded-2xl border bg-card p-3'>
                          <h4 className='text-sm font-semibold text-foreground'>Attached Materials</h4>
                          <div className='mt-3'>
                            <a
                              href={activeAssignment.attachment}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors"
                            >
                              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <Paperclip className="size-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-foreground">View Attachment</p>
                              </div>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='space-y-4'>
                      <div className='rounded-2xl border bg-card p-4'>
                        <h3 className='text-sm font-semibold text-foreground mb-4'>
                          Submission Portal
                        </h3>

                        {getStatus(activeAssignment) === 'Submitted' ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                              <Clock className="w-6 h-6" />
                            </div>
                            <p className="font-medium text-sm">Assignment Submitted</p>
                            <p className="text-xs mt-1 opacity-80">This assignment is no longer active.</p>
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
                                    'w-full rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition group',
                                    'hover:bg-muted/60 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
                                  )}
                                >
                                  <div className="bg-background rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-sm border group-hover:scale-105 transition-transform">
                                    <UploadCloud className='size-5 text-primary' />
                                  </div>
                                  <p className='text-sm font-semibold text-foreground'>
                                    {selectedFile ? 'Change file' : 'Click to browse'}
                                  </p>
                                  {selectedFile ? (
                                    <p className='mt-2 truncate text-xs font-medium text-primary bg-primary/10 py-1 px-2 rounded-md inline-block max-w-full'>
                                      {selectedFile.name}
                                    </p>
                                  ) : (
                                    <p className='mt-1 text-xs text-muted-foreground'>
                                      Upload your work here
                                    </p>
                                  )}
                                </button>
                              </>
                            )}

                            <div className='mt-4 space-y-2'>
                              <label
                                htmlFor='submission-comment'
                                className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'
                              >
                                {activeAssignment.submission_type === 'text' ? 'Your Answer' : 'Submission Comments (Optional)'}
                              </label>
                              <textarea
                                id='submission-comment'
                                rows={activeAssignment.submission_type === 'text' ? 6 : 3}
                                value={textAnswer}
                                onChange={(e) => setTextAnswer(e.target.value)}
                                placeholder={activeAssignment.submission_type === 'text' ? 'Type your complete answer here...' : 'Add a note to your teacher...'}
                                className='w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60'
                              />
                            </div>

                            <Button
                              className='mt-4 h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                              onClick={handleSubmit}
                              disabled={submitMutation.isPending}
                            >
                              {submitMutation.isPending ? 'Submitting...' : 'Submit Homework'}
                            </Button>
                          </>
                        )}
                      </div>

                      {getStatus(activeAssignment) === 'Late' && (
                        <div className="flex gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm items-start border border-amber-200 dark:border-amber-800/50">
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          <p>This assignment is past its due date. Your submission will be marked as late.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className='flex h-[300px] items-center justify-center text-muted-foreground'>
                No homework selected.
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
