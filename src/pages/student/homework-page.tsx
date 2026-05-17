import { useMemo, useRef, useState } from 'react'
import {
  Calendar,
  Clock,
  Paperclip,
  UploadCloud,
  PencilLine,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useStudentHomework } from '@/hooks/student/useStudentPortal'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StudentInfoTile } from '@/components/student/common/student-info-tile'
import { StudentPageHeader } from '@/components/student/common/student-page-header'
import { StudentProgressMeter } from '@/components/student/common/student-progress-meter'

export default function StudentHomeworkPage() {
  const { data: assignments = [] } = useStudentHomework()
  const [activeId, setActiveId] = useState<number | null>(
    assignments[0]?.id ?? null
  )
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [editComment, setEditComment] = useState('')

  const activeAssignment = useMemo(
    () =>
      assignments.find((assignment) => assignment.id === activeId) ??
      assignments[0] ??
      null,
    [activeId, assignments]
  )

  const statusBadge = (status: 'Pending' | 'Submitted' | 'Late') => {
    if (status === 'Submitted') {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    }
    if (status === 'Late') {
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
    }

    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
  }

  const visibleAssignments = assignments

  return (
    <div className='-mx-4 md:-mx-8'>
      <div className='px-4 md:px-8'>
        <StudentPageHeader
          title='Vazifalar'
          description='Keep track of your language milestones and assignments.'
        />

        <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]'>
          <Card className='shadow-sm'>
            <CardHeader className='pb-2'>
              <div>
                <CardTitle className='text-base'>Assignment Hub</CardTitle>
                <p className='text-xs text-muted-foreground'>
                  Pick a task to see details and submit.
                </p>
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <ScrollArea className='h-[calc(100svh-220px)]'>
                <div className='space-y-2 p-2 pt-0'>
                  {visibleAssignments.map((item) => {
                    const isActive = item.id === (activeAssignment?.id ?? null)

                    return (
                      <button
                        key={item.id}
                        type='button'
                        onClick={() => setActiveId(item.id)}
                        className={cn(
                          'w-full rounded-2xl border bg-card px-3 py-2.5 text-left transition',
                          'hover:bg-accent hover:text-accent-foreground hover:shadow-sm',
                          isActive
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border'
                        )}
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-semibold text-foreground'>
                              {item.title}
                            </p>
                            <p className='truncate text-xs text-muted-foreground'>
                              {item.course}
                            </p>
                          </div>
                          <Badge
                            variant='outline'
                            className={cn(
                              'rounded-full',
                              statusBadge(item.status)
                            )}
                          >
                            {item.status}
                          </Badge>
                        </div>

                        <div className='mt-3 flex items-center justify-between gap-3'>
                          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                            <Calendar className='size-3.5' />
                            <span>Due {item.dueDate}</span>
                          </div>
                          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                            <Clock className='size-3.5' />
                            <span>
                              {Math.max(0, 100 - item.completion)}% left
                            </span>
                          </div>
                        </div>

                        <StudentProgressMeter
                          value={item.completion}
                          className='mt-3'
                        />
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className='shadow-sm'>
            {activeAssignment ? (
              <>
                <CardHeader className='pb-3'>
                  <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                    <div className='min-w-0'>
                      <p className='text-xs font-semibold tracking-wide text-muted-foreground'>
                        {activeAssignment.course.toUpperCase()}
                      </p>
                      <CardTitle className='mt-2 text-2xl leading-tight'>
                        {activeAssignment.title}
                      </CardTitle>
                      <div className='mt-3 flex flex-wrap items-center gap-2'>
                        <Badge
                          variant='outline'
                          className={cn(
                            'rounded-full',
                            statusBadge(activeAssignment.status)
                          )}
                        >
                          {activeAssignment.status}
                        </Badge>
                        <Badge
                          variant='outline'
                          className='rounded-full bg-muted text-muted-foreground'
                        >
                          Due {activeAssignment.dueDate}
                        </Badge>
                        <Badge
                          variant='outline'
                          className='rounded-full bg-muted text-muted-foreground'
                        >
                          Grade weight: 15%
                        </Badge>
                      </div>
                    </div>

                    <div className='flex items-center gap-3 rounded-2xl border bg-card px-4 py-3'>
                      <Avatar className='size-10'>
                        <AvatarFallback className='bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'>
                          T
                        </AvatarFallback>
                      </Avatar>
                      <div className='leading-tight'>
                        <p className='text-xs font-semibold text-muted-foreground'>
                          Teacher
                        </p>
                        <p className='text-sm font-semibold text-foreground'>
                          Ms. Sarah
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Linguistics Department
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className='grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]'>
                    <div className='space-y-4'>
                      <div>
                        <h3 className='text-sm font-semibold text-foreground'>
                          Task Description
                        </h3>
                        <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                          Write a clear and well-structured submission for this
                          assignment. Focus on accuracy, vocabulary, and
                          clarity.
                        </p>
                      </div>

                      <div className='rounded-2xl border bg-card p-3'>
                        <h4 className='text-sm font-semibold text-foreground'>
                          Requirements
                        </h4>
                        <div className='mt-3 space-y-2'>
                          <div className='flex items-start gap-2 text-sm text-muted-foreground'>
                            <span className='mt-1 size-1.5 shrink-0 rounded-full bg-rose-500' />
                            <p>Answer all questions in complete sentences.</p>
                          </div>
                          <div className='flex items-start gap-2 text-sm text-muted-foreground'>
                            <span className='mt-1 size-1.5 shrink-0 rounded-full bg-rose-500' />
                            <p>
                              Use at least 10 new vocabulary words from the
                              unit.
                            </p>
                          </div>
                          <div className='flex items-start gap-2 text-sm text-muted-foreground'>
                            <span className='mt-1 size-1.5 shrink-0 rounded-full bg-rose-500' />
                            <p>Submit as PDF or DOCX.</p>
                          </div>
                        </div>
                      </div>

                      <div className='rounded-2xl border bg-card p-3'>
                        <h4 className='text-sm font-semibold text-foreground'>
                          Attached Files
                        </h4>
                        <div className='mt-3'>
                          <StudentInfoTile
                            title='Status'
                            value='No files attached.'
                            muted
                          />
                        </div>
                      </div>
                    </div>

                    <div className='space-y-4'>
                      <div className='rounded-2xl border bg-card p-3'>
                        <h3 className='text-sm font-semibold text-foreground'>
                          Submission Portal
                        </h3>
                        <input
                          ref={fileInputRef}
                          type='file'
                          className='hidden'
                          accept='.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            setSelectedFileName(file?.name ?? '')
                          }}
                        />
                        <button
                          type='button'
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            'mt-3 w-full rounded-2xl border-2 border-dashed border-border bg-muted/50 p-6 text-center transition',
                            'hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none'
                          )}
                        >
                          <UploadCloud className='mx-auto size-10 text-muted-foreground' />
                          <p className='mt-3 text-sm font-semibold text-foreground'>
                            Drag and drop your file here
                          </p>
                          <p className='mt-1 text-xs text-muted-foreground'>
                            or click to browse
                          </p>
                          {selectedFileName ? (
                            <p className='mt-3 truncate text-xs font-medium text-foreground'>
                              {selectedFileName}
                            </p>
                          ) : null}
                        </button>

                        <div className='mt-4 space-y-2'>
                          <label
                            htmlFor='submission-comment'
                            className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'
                          >
                            Submission Comments
                          </label>
                          <textarea
                            id='submission-comment'
                            rows={3}
                            placeholder='Add a note to your teacher...'
                            className='w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500/20 focus:outline-none'
                          />
                        </div>
                      </div>

                      <Button className='h-12 w-full rounded-2xl bg-rose-600 text-base text-white hover:bg-rose-700'>
                        Submit Homework
                      </Button>
                      {activeAssignment.status === 'Submitted' && (
                        <Button
                          variant='outline'
                          className='h-12 w-full rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/30'
                          onClick={() => {
                            setEditComment('')
                            setEditOpen(true)
                          }}
                        >
                          <PencilLine size={16} className='mr-2' />
                          Edit Submission
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className='flex h-[300px] items-center justify-center text-muted-foreground'>
                No homework found.
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Submission Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className='max-w-md rounded-2xl border-none bg-white p-6 shadow-[0_30px_60px_-15px_rgba(25,28,30,0.20)] dark:bg-slate-900 dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold text-gray-800 dark:text-white'>
              Edit Submission
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4 pt-4'>
            <div>
              <Label htmlFor='edit-comment'>Submission Comment</Label>
              <textarea
                id='edit-comment'
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder='Update your submission comment...'
                rows={4}
                className='mt-1 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500/20 focus:outline-none'
              />
            </div>
            <div className='flex justify-end gap-3 pt-4'>
              <Button variant='outline' onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success('Submission updated successfully')
                  setEditOpen(false)
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
