import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'
import {
  Calendar,
  Clock,
  Filter,
  Paperclip,
  UploadCloud,
} from 'lucide-react'
import { useStudentHomework } from '@/hooks/student/useStudentPortal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/student/homework')({
  component: StudentHomeworkPage,
})

function StudentHomeworkPage() {
  const { data: assignments = [] } = useStudentHomework()
  const [activeId, setActiveId] = useState<number | null>(assignments[0]?.id ?? null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string>('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Submitted' | 'Late'>('all')
  const [sortBy, setSortBy] = useState<'default' | 'dueSoon' | 'completionHigh'>('default')

  const activeAssignment = useMemo(() => {
    return assignments.find((a) => a.id === activeId) ?? assignments[0] ?? null
  }, [activeId, assignments])

  const statusBadge = (status: 'Pending' | 'Submitted' | 'Late') => {
    if (status === 'Submitted') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
    if (status === 'Late') return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
  }

  const normalizedDueDate = (value: string) => {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date
    const dateFromShort = new Date(`${value} 00:00:00`)
    if (!Number.isNaN(dateFromShort.getTime())) return dateFromShort
    return null
  }

  const visibleAssignments = useMemo(() => {
    let list = assignments

    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter)
    }

    if (sortBy === 'dueSoon') {
      list = [...list].sort((a, b) => {
        const da = normalizedDueDate(a.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY
        const db = normalizedDueDate(b.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY
        return da - db
      })
    } else if (sortBy === 'completionHigh') {
      list = [...list].sort((a, b) => b.completion - a.completion)
    }

    return list
  }, [assignments, sortBy, statusFilter])

  return (
    <div className='-mx-4 md:-mx-8'>
      <div className='px-4 md:px-8'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1 className='text-3xl font-semibold text-foreground'>Vazifalar</h1>
            <p className='text-sm text-muted-foreground'>Keep track of your language milestones and assignments.</p>
          </div>
        </div>

        <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]'>
          <Card className='shadow-sm'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <CardTitle className='text-base'>Assignment Hub</CardTitle>
                  <p className='text-xs text-muted-foreground'>Pick a task to see details and submit.</p>
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground'
                  onClick={() => setFilterOpen(true)}
                  aria-label='Open filters'
                >
                  <Filter className='size-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <ScrollArea className='h-[calc(100svh-220px)]'>
                <div className='p-2 pt-0'>
                  <div className='space-y-2'>
                    {visibleAssignments.map((item) => {
                      const isActive = item.id === (activeAssignment?.id ?? null)

                      return (
                        <button
                          key={item.id}
                          type='button'
                          onClick={() => setActiveId(item.id)}
                          className={cn(
                            'w-full text-left rounded-2xl border bg-card px-3 py-2.5 transition',
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
                              <p className='truncate text-xs text-muted-foreground'>{item.course}</p>
                            </div>
                            <Badge
                              variant='outline'
                              className={cn('rounded-full', statusBadge(item.status))}
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
                              <span>{Math.max(0, 100 - item.completion)}% left</span>
                            </div>
                          </div>

                          <div className='mt-3 h-2 w-full overflow-hidden rounded-full bg-muted'>
                            <div
                              className='h-full rounded-full bg-rose-500'
                              style={{ width: `${item.completion}%` }}
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>
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
                          className={cn('rounded-full', statusBadge(activeAssignment.status))}
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
                        <p className='text-xs font-semibold text-muted-foreground'>Teacher</p>
                        <p className='text-sm font-semibold text-foreground'>Ms. Sarah</p>
                        <p className='text-xs text-muted-foreground'>Linguistics Department</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className='grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]'>
                    <div className='space-y-4'>
                      <div>
                        <h3 className='text-sm font-semibold text-foreground'>Task Description</h3>
                        <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                          Write a clear and well-structured submission for this assignment. Focus on accuracy, vocabulary, and clarity.
                        </p>
                      </div>

                      <div className='rounded-2xl border bg-card p-3'>
                        <h4 className='text-sm font-semibold text-foreground'>Requirements</h4>
                        <div className='mt-3 space-y-2'>
                          <div className='flex items-start gap-2 text-sm text-muted-foreground'>
                            <span className='mt-1 size-1.5 shrink-0 rounded-full bg-rose-500' />
                            <p>Answer all questions in complete sentences.</p>
                          </div>
                          <div className='flex items-start gap-2 text-sm text-muted-foreground'>
                            <span className='mt-1 size-1.5 shrink-0 rounded-full bg-rose-500' />
                            <p>Use at least 10 new vocabulary words from the unit.</p>
                          </div>
                          <div className='flex items-start gap-2 text-sm text-muted-foreground'>
                            <span className='mt-1 size-1.5 shrink-0 rounded-full bg-rose-500' />
                            <p>Submit as PDF or DOCX.</p>
                          </div>
                        </div>
                      </div>

                      <div className='rounded-2xl border bg-card p-3'>
                        <h4 className='text-sm font-semibold text-foreground'>Attached Files</h4>
                        <div className='mt-3 flex items-center gap-2 text-sm text-muted-foreground'>
                          <Paperclip className='size-4 text-muted-foreground' />
                          <span>No files attached.</span>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-4'>
                      <div className='rounded-2xl border bg-card p-3'>
                        <h3 className='text-sm font-semibold text-foreground'>Submission Portal</h3>
                        <input
                          ref={fileInputRef}
                          type='file'
                          className='hidden'
                          accept='.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            setSelectedFileName(file?.name ?? '')
                          }}
                        />
                        <button
                          type='button'
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            'mt-3 w-full rounded-2xl border-2 border-dashed border-border bg-muted/50 p-6 text-center transition',
                            'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
                          )}
                        >
                          <UploadCloud className='mx-auto size-10 text-muted-foreground' />
                          <p className='mt-3 text-sm font-semibold text-foreground'>
                            Drag and drop your file here
                          </p>
                          <p className='mt-1 text-xs text-muted-foreground'>or click to browse</p>
                          {selectedFileName ? (
                            <p className='mt-3 truncate text-xs font-medium text-foreground'>
                              {selectedFileName}
                            </p>
                          ) : null}
                        </button>
                      </div>

                      <div className='rounded-2xl border bg-card p-3'>
                        <h3 className='text-sm font-semibold text-foreground'>Teacher&apos;s Previous Notes</h3>
                        <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                          Keep your paragraphs short and focused. Remember to support your ideas with examples.
                        </p>
                      </div>

                      <Button className='h-12 w-full rounded-2xl bg-rose-600 text-base hover:bg-rose-700 text-white'>
                        Submit Homework
                      </Button>
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

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Filtrlash</DialogTitle>
            <DialogDescription>Vazifalarni status bo‘yicha filtrlash yoki tartiblash.</DialogDescription>
          </DialogHeader>

          <div className='grid gap-5'>
            <div className='grid gap-3'>
              <p className='text-sm font-semibold text-foreground'>Holat</p>
              <RadioGroup
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
                className='gap-2'
              >
                <div className='flex items-center gap-2'>
                  <RadioGroupItem value='all' id='status-all' />
                  <Label htmlFor='status-all'>Barchasi</Label>
                </div>
                <div className='flex items-center gap-2'>
                  <RadioGroupItem value='Pending' id='status-pending' />
                  <Label htmlFor='status-pending'>Kutilmoqda</Label>
                </div>
                <div className='flex items-center gap-2'>
                  <RadioGroupItem value='Submitted' id='status-submitted' />
                  <Label htmlFor='status-submitted'>Yuborilgan</Label>
                </div>
                <div className='flex items-center gap-2'>
                  <RadioGroupItem value='Late' id='status-late' />
                  <Label htmlFor='status-late'>Kechikkan</Label>
                </div>
              </RadioGroup>
            </div>

            <div className='grid gap-3'>
              <p className='text-sm font-semibold text-foreground'>Tartiblash</p>
              <RadioGroup
                value={sortBy}
                onValueChange={(v) => setSortBy(v as typeof sortBy)}
                className='gap-2'
              >
                <div className='flex items-center gap-2'>
                  <RadioGroupItem value='default' id='sort-default' />
                  <Label htmlFor='sort-default'>Standart</Label>
                </div>
                <div className='flex items-center gap-2'>
                  <RadioGroupItem value='dueSoon' id='sort-due' />
                  <Label htmlFor='sort-due'>Muddat yaqin</Label>
                </div>
                <div className='flex items-center gap-2'>
                  <RadioGroupItem value='completionHigh' id='sort-completion' />
                  <Label htmlFor='sort-completion'>Bajarilishi yuqori</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setStatusFilter('all')
                setSortBy('default')
              }}
            >
              Tozalash
            </Button>
            <Button type='button' onClick={() => setFilterOpen(false)}>
              Qo‘llash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
