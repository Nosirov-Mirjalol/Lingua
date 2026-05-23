import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Group, GroupStudent } from '@/api/service/teacher/group.type'
import { adminDialogClass, adminInputClass } from '@/lib/admin-ui'
import { cn } from '@/lib/utils'
import { useAdminAddStudentToGroup } from '@/hooks/admin/groups/useAdminAddStudentToGroup'
import { useAdminGroupAvailableStudents } from '@/hooks/admin/groups/useAdminGroupAvailableStudents'
import { useAdminGroupStudents } from '@/hooks/admin/groups/useAdminGroupStudents'
import { useAdminGroups } from '@/hooks/admin/groups/useAdminGroups'
import { useAdminRemoveStudentFromGroup } from '@/hooks/admin/groups/useAdminRemoveStudentFromGroup'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { RoseButton } from '@/components/ui/rose-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const WEEK_DAYS_LABELS: Record<string, string> = {
  toq_kunlar: 'Toq kunlar',
  juft_kunlar: 'Juft kunlar',
  har_kuni: 'Har kuni',
}

function studentLabel(
  id: number,
  fullName?: string | null,
  username?: string | null
): string {
  const n = fullName?.trim()
  if (n) return n
  if (username?.trim()) return username.trim()
  return `Talaba #${id}`
}

function formatTime(value?: string) {
  if (!value) return '—'
  return value.length >= 5 ? value.slice(0, 5) : value
}

function formatGroupSchedule(group: Group) {
  const days =
    group.week_days && String(group.week_days).trim()
      ? String(group.week_days)
      : group.week_days_type
        ? (WEEK_DAYS_LABELS[group.week_days_type] ?? group.week_days_type)
        : '—'
  const time = [formatTime(group.start_time), formatTime(group.end_time)]
    .filter((t) => t !== '—')
    .join(' – ')
  return [days, time].filter((p) => p && p !== '—').join(' · ')
}

function useDebouncedValue(value: string, delayMs = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

type AdminGroupStudentsModalProps = {
  groupId: number | null
  onOpenChange: (open: boolean) => void
}

export function AdminGroupStudentsModal({
  groupId,
  onOpenChange,
}: AdminGroupStudentsModalProps) {
  const open = groupId != null
  const [selectedUsername, setSelectedUsername] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [removingId, setRemovingId] = useState<number | null>(null)

  const debouncedSearch = useDebouncedValue(studentSearch)

  const { data: groups = [], isLoading: groupsLoading } = useAdminGroups()

  const groupMeta = useMemo(
    () => groups.find((g) => g.id === groupId) ?? null,
    [groups, groupId]
  )

  const {
    data: groupWithStudents,
    isLoading: studentsLoading,
    isFetching: studentsFetching,
    refetch: refetchStudents,
    isError: studentsError,
  } = useAdminGroupStudents(open ? groupId : null)

  const {
    data: availableStudents = [],
    isLoading: availableLoading,
    isFetching: availableFetching,
    isError: availableError,
    refetch: refetchAvailable,
  } = useAdminGroupAvailableStudents(open ? groupId : null, debouncedSearch)

  const addMutation = useAdminAddStudentToGroup(groupId ?? 0)
  const removeMutation = useAdminRemoveStudentFromGroup(groupId ?? 0)

  const displayGroup = groupWithStudents ?? groupMeta
  const enrolledStudents: GroupStudent[] = useMemo(
    () => groupWithStudents?.students ?? [],
    [groupWithStudents?.students]
  )

  const enrolledUsernames = useMemo(
    () =>
      new Set(
        enrolledStudents
          .map((s) => s.username?.trim().toLowerCase())
          .filter(Boolean) as string[]
      ),
    [enrolledStudents]
  )

  const pickableStudents = useMemo(
    () =>
      availableStudents.filter((s) => {
        const u = s.username?.trim().toLowerCase()
        return u && !enrolledUsernames.has(u)
      }),
    [availableStudents, enrolledUsernames]
  )

  const scheduleText = displayGroup ? formatGroupSchedule(displayGroup) : ''

  useEffect(() => {
    if (!open) {
      setSelectedUsername('')
      setStudentSearch('')
    }
  }, [open])

  const handleRefresh = () => {
    void refetchStudents()
    void refetchAvailable()
  }

  const handleAdd = async () => {
    if (!groupId) return

    const username = selectedUsername.trim()
    if (!username) {
      toast.error('Talabani tanlang')
      return
    }

    const picked = availableStudents.find(
      (s) => s.username?.trim() === username
    )
    if (!picked) {
      toast.error('Tanlangan talaba topilmadi')
      return
    }

    try {
      await toast.promise(
        addMutation.mutateAsync({
          payload: { username },
        }),
        {
          loading: "Qo'shilmoqda...",
          success: (res) => res.detail || "Talaba qo'shildi",
          error: (err: { message?: string }) =>
            err?.message || "Qo'shishda xatolik",
        }
      )
      setSelectedUsername('')
    } catch {
      /* toast */
    }
  }

  const handleRemove = async (studentUserId: number) => {
    setRemovingId(studentUserId)
    try {
      await toast.promise(removeMutation.mutateAsync(studentUserId), {
        loading: "O'chirilmoqda...",
        success: (res) => res.detail || 'Talaba olib tashlandi',
        error: (err: { message?: string }) =>
          err?.message || "O'chirishda xatolik",
      })
    } finally {
      setRemovingId((c) => (c === studentUserId ? null : c))
    }
  }

  const listBusy = studentsLoading && !groupWithStudents
  const listRefreshing = studentsFetching && !!groupWithStudents

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onOpenChange(false)
      }}
    >
      <DialogContent
        className={cn(
          adminDialogClass,
          'flex max-h-[min(90vh,85vh)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden border-none p-0 sm:max-w-[680px] md:max-w-[760px] lg:max-w-[820px]'
        )}
      >
        <DialogHeader className='shrink-0 space-y-2 border-b px-5 py-4'>
          <div className='flex items-start justify-between gap-3'>
            <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
              <Users className='h-5 w-5 text-primary' />
              {groupsLoading && !displayGroup
                ? 'Yuklanmoqda...'
                : (displayGroup?.name ?? 'Guruh')}
            </DialogTitle>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-9 w-9 shrink-0'
              title='Yangilash'
              disabled={studentsFetching || availableFetching}
              onClick={handleRefresh}
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4',
                  (studentsFetching || availableFetching) && 'animate-spin'
                )}
              />
            </Button>
          </div>
          <DialogDescription asChild>
            <div className='space-y-1.5 text-left text-sm text-muted-foreground'>
              <p>Guruhga talaba qo&apos;shish va ro&apos;yxatdan chiqarish</p>
              {scheduleText ? (
                <p className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-foreground/80'>
                  <span className='inline-flex items-center gap-1'>
                    <Calendar className='h-3.5 w-3.5' />
                    {scheduleText}
                  </span>
                  {displayGroup?.start_date ? (
                    <span>Boshlanish: {displayGroup.start_date}</span>
                  ) : null}
                </p>
              ) : null}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4'>
          <div className='rounded-xl border bg-muted/30 p-4'>
            <p className='mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
              Talaba qo&apos;shish
            </p>
            <div className='mb-3'>
              <div className='relative'>
                <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder='Ism yoki username bo‘yicha qidirish...'
                  className={cn(adminInputClass, 'h-11 bg-background pl-9')}
                />
              </div>
            </div>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Select
                value={selectedUsername}
                onValueChange={setSelectedUsername}
              >
                <SelectTrigger
                  className={cn(
                    adminInputClass,
                    'h-11 min-w-0 flex-1 bg-background'
                  )}
                >
                  <SelectValue placeholder='Talabani tanlang...' />
                </SelectTrigger>
                <SelectContent className='max-h-60'>
                  {availableLoading && !availableStudents.length ? (
                    <div className='px-3 py-2 text-sm text-muted-foreground'>
                      Yuklanmoqda...
                    </div>
                  ) : availableError ? (
                    <div className='px-3 py-2 text-sm text-destructive'>
                      Ro&apos;yxat yuklanmadi
                    </div>
                  ) : pickableStudents.length === 0 ? (
                    <div className='px-3 py-2 text-sm text-muted-foreground'>
                      {debouncedSearch
                        ? 'Qidiruv bo‘yicha talaba topilmadi'
                        : "Guruhga qo'shish uchun mavjud talaba yo'q"}
                    </div>
                  ) : (
                    pickableStudents.map((s) => (
                      <SelectItem key={s.id} value={s.username}>
                        <span className='font-medium'>
                          {studentLabel(s.id, s.full_name, s.username)}
                        </span>
                        <span className='ml-1 text-xs text-muted-foreground'>
                          @{s.username}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <RoseButton
                type='button'
                className='h-11 shrink-0 px-6'
                disabled={!selectedUsername || addMutation.isPending}
                onClick={handleAdd}
              >
                {addMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <>
                    <UserPlus className='mr-1.5 h-4 w-4' />
                    Qo&apos;shish
                  </>
                )}
              </RoseButton>
            </div>
          </div>

          <div>
            <div className='mb-3 flex items-center justify-between gap-2'>
              <p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                Guruh talabalari ({enrolledStudents.length})
              </p>
              {listRefreshing ? (
                <span className='text-xs text-muted-foreground'>
                  Yangilanmoqda...
                </span>
              ) : null}
            </div>

            {listBusy ? (
              <div className='flex justify-center py-10'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              </div>
            ) : studentsError ? (
              <p className='rounded-lg border border-dashed py-8 text-center text-sm text-destructive'>
                Talabalar ro&apos;yxati yuklanmadi. Yangilash tugmasini bosing.
              </p>
            ) : enrolledStudents.length === 0 ? (
              <p className='rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground'>
                Hali talaba yo&apos;q — yuqoridan username bilan qo&apos;shing
              </p>
            ) : (
              <ul className='max-h-72 space-y-2 overflow-y-auto pr-1'>
                {enrolledStudents.map((s) => (
                  <li
                    key={`${s.id}-${s.student}`}
                    className='flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3'
                  >
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-semibold text-foreground'>
                        {studentLabel(
                          s.student,
                          s.full_name ?? s.student_name,
                          s.username
                        )}
                      </p>
                      {s.username ? (
                        <p className='truncate text-xs text-muted-foreground'>
                          @{s.username}
                        </p>
                      ) : null}
                      {s.joined_at ? (
                        <p className='truncate text-xs text-muted-foreground/80'>
                          Qo&apos;shilgan: {s.joined_at.slice(0, 10)}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='shrink-0 text-destructive hover:bg-destructive/10'
                      disabled={removingId === s.student}
                      onClick={() => handleRemove(s.student)}
                    >
                      {removingId === s.student ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Trash2 className='h-4 w-4' />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className='shrink-0 border-t px-5 py-4'>
          <Button
            type='button'
            variant='outline'
            className='h-11 w-full'
            onClick={() => onOpenChange(false)}
          >
            Yopish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
