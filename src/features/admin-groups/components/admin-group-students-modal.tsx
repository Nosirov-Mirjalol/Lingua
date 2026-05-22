import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Calendar, Loader2, Trash2, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { studentListItemToGroupMember } from '@/api/service/admin/group.service'
import type { Group, GroupStudent } from '@/api/service/teacher/group.type'
import {
  mergeEnrolledStudents,
  useAdminAddStudentToGroup,
} from '@/hooks/admin/groups/useAdminAddStudentToGroup'
import { useAdminGroupAvailableStudents } from '@/hooks/admin/groups/useAdminGroupAvailableStudents'
import { useAdminGroups } from '@/hooks/admin/groups/useAdminGroups'
import { useAdminRemoveStudentFromGroup } from '@/hooks/admin/groups/useAdminRemoveStudentFromGroup'
import { cn } from '@/lib/utils'
import { adminDialogClass, adminInputClass } from '@/lib/admin-ui'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

type AdminGroupStudentsModalProps = {
  groupId: number | null
  onOpenChange: (open: boolean) => void
}

export function AdminGroupStudentsModal({
  groupId,
  onOpenChange,
}: AdminGroupStudentsModalProps) {
  const open = groupId != null
  const queryClient = useQueryClient()
  const [selectedKey, setSelectedKey] = useState('')
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [enrolledStudents, setEnrolledStudents] = useState<GroupStudent[]>([])

  const { data: groups = [], isLoading: groupsLoading } = useAdminGroups()

  const groupMeta = useMemo(
    () => groups.find((g) => g.id === groupId) ?? null,
    [groups, groupId]
  )

  const {
    data: availableStudents = [],
    isLoading: availableLoading,
    isError: availableError,
  } = useAdminGroupAvailableStudents(groupId)

  const addMutation = useAdminAddStudentToGroup(groupId ?? 0)
  const removeMutation = useAdminRemoveStudentFromGroup(groupId ?? 0)

  const scheduleText = groupMeta ? formatGroupSchedule(groupMeta) : ''

  useEffect(() => {
    if (!open || !groupId) {
      setEnrolledStudents([])
      setSelectedKey('')
      return
    }

    const cached = queryClient.getQueryData<Group>([
      'admin',
      'groups',
      'students',
      groupId,
    ])
    const fromList = groups.find((g) => g.id === groupId)
    const initial = mergeEnrolledStudents(
      [],
      cached?.students ?? fromList?.students ?? []
    )
    setEnrolledStudents(initial)
  }, [open, groupId, groups, queryClient])

  const handleAdd = async () => {
    if (!groupId || !selectedKey) return

    const picked = availableStudents.find((s) => String(s.id) === selectedKey)
    if (!picked) {
      toast.error('Talabani tanlang')
      return
    }

    const username = picked.username?.trim()
    const addPayload = username
      ? { username }
      : { student: picked.id }

    const member = studentListItemToGroupMember(picked)

    try {
      await toast.promise(
        addMutation.mutateAsync({ payload: addPayload, picked }),
        {
          loading: "Qo'shilmoqda...",
          success: (r) => r.detail || "Talaba qo'shildi",
          error: (err: { message?: string }) =>
            err?.message || "Qo'shishda xatolik",
        }
      )
      setEnrolledStudents((prev) => mergeEnrolledStudents(prev, [member]))
      setSelectedKey('')
    } catch {
      /* toast */
    }
  }

  const handleRemove = async (studentUserId: number) => {
    setRemovingId(studentUserId)
    try {
      await toast.promise(removeMutation.mutateAsync(studentUserId), {
        loading: "O'chirilmoqda...",
        success: (r) => r.detail || "Talaba olib tashlandi",
        error: (err: { message?: string }) =>
          err?.message || "O'chirishda xatolik",
      })
      setEnrolledStudents((prev) =>
        prev.filter((s) => s.student !== studentUserId)
      )
    } finally {
      setRemovingId((c) => (c === studentUserId ? null : c))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setSelectedKey('')
          onOpenChange(false)
        }
      }}
    >
      <DialogContent
        className={cn(
          adminDialogClass,
          'flex w-[calc(100%-2rem)] max-h-[min(90vh,85vh)] flex-col gap-0 overflow-hidden border-none p-0 sm:max-w-[680px] md:max-w-[760px] lg:max-w-[820px]'
        )}
      >
        <DialogHeader className='shrink-0 space-y-2 border-b px-5 py-4'>
          <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
            <Users className='h-5 w-5 text-primary' />
            {groupsLoading ? 'Yuklanmoqda...' : (groupMeta?.name ?? 'Guruh')}
          </DialogTitle>
          <DialogDescription asChild>
            <div className='space-y-1.5 text-left text-sm text-muted-foreground'>
              <p>Guruhga talaba qo&apos;shish va ro&apos;yxatdan chiqarish</p>
              {scheduleText ? (
                <p className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-foreground/80'>
                  <span className='inline-flex items-center gap-1'>
                    <Calendar className='h-3.5 w-3.5' />
                    {scheduleText}
                  </span>
                  {groupMeta?.start_date ? (
                    <span>Boshlanish: {groupMeta.start_date}</span>
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
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Select value={selectedKey} onValueChange={setSelectedKey}>
                <SelectTrigger
                  className={cn(
                    adminInputClass,
                    'h-11 min-w-0 flex-1 bg-background'
                  )}
                >
                  <SelectValue placeholder='Talabani tanlang...' />
                </SelectTrigger>
                <SelectContent className='max-h-60'>
                  {availableLoading ? (
                    <div className='px-3 py-2 text-sm text-muted-foreground'>
                      Yuklanmoqda...
                    </div>
                  ) : availableError ? (
                    <div className='px-3 py-2 text-sm text-destructive'>
                      Ro&apos;yxat yuklanmadi
                    </div>
                  ) : availableStudents.length === 0 ? (
                    <div className='px-3 py-2 text-sm text-muted-foreground'>
                      Mavjud talaba yo&apos;q
                    </div>
                  ) : (
                    availableStudents.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {studentLabel(s.id, s.full_name, s.username)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <RoseButton
                type='button'
                className='h-11 shrink-0 px-6'
                disabled={!selectedKey || addMutation.isPending}
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
            <p className='mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
              Guruh talabalari ({enrolledStudents.length})
            </p>

            {groupsLoading ? (
              <div className='flex justify-center py-10'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              </div>
            ) : enrolledStudents.length === 0 ? (
              <p className='rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground'>
                Hali talaba yo&apos;q
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
