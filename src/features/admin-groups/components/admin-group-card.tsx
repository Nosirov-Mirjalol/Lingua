import type { ReactNode } from 'react'
import { Clock, Trash2, Users as UsersIcon } from 'lucide-react'
import type { Group } from '@/api/service/teacher/group.type'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const WEEK_DAYS_LABELS: Record<string, string> = {
  toq_kunlar: 'Toq kunlar',
  juft_kunlar: 'Juft kunlar',
  har_kuni: 'Har kuni',
}

function formatTime(value?: string) {
  if (!value) return '—'
  return value.length >= 5 ? value.slice(0, 5) : value
}

function formatSchedule(group: Group) {
  const from = formatTime(group.start_time)
  const to = formatTime(group.end_time)
  if (from === '—' && to === '—') return '—'
  return `${from} – ${to}`
}

function formatWeekDays(group: Group) {
  if (group.week_days && String(group.week_days).trim()) {
    return String(group.week_days)
  }
  if (group.week_days_type) {
    return WEEK_DAYS_LABELS[group.week_days_type] ?? group.week_days_type
  }
  return '—'
}

type DetailRowProps = {
  label: string
  value: ReactNode
  valueClassName?: string
}

function DetailRow({ label, value, valueClassName }: DetailRowProps) {
  return (
    <div className='admin-group-card__row grid grid-cols-[minmax(4.5rem,auto)_1fr] items-center gap-x-3 gap-y-0.5 sm:grid-cols-[5.5rem_1fr]'>
      <span className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>
        {label}
      </span>
      <span
        className={cn(
          'min-w-0 text-right text-sm font-medium text-foreground',
          valueClassName
        )}
      >
        {value}
      </span>
    </div>
  )
}

type AdminGroupCardProps = {
  group: Group
  courseName: string
  teacherName: string
  onDelete: () => void
}

export function AdminGroupCard({
  group,
  courseName,
  teacherName,
  onDelete,
}: AdminGroupCardProps) {
  const studentCount = group.students?.length ?? 0
  const isActive = group.status === 'active'

  return (
    <article className='admin-group-card flex h-full flex-col rounded-2xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md sm:p-5'>
      <div className='admin-group-card__head mb-4 flex items-start gap-3'>
        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12 sm:rounded-2xl'>
          <UsersIcon className='h-5 w-5 sm:h-6 sm:w-6' />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <h3 className='admin-group-card__title line-clamp-2 text-base leading-snug font-bold text-foreground sm:text-[1.05rem]'>
              {group.name}
            </h3>
            <Button
              variant='ghost'
              size='icon'
              className='-mt-0.5 h-8 w-8 shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive'
              onClick={onDelete}
              aria-label="Guruhni o'chirish"
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
          <div className='mt-1.5 flex flex-wrap items-center gap-2'>
            <span className='text-[11px] font-medium text-muted-foreground'>
              ID #{group.id}
            </span>
            <Badge
              variant='outline'
              className={cn(
                'h-5 border px-2 text-[10px] font-bold uppercase',
                isActive
                  ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400'
                  : 'text-muted-foreground'
              )}
            >
              {isActive ? 'Faol' : 'Tugatilgan'}
            </Badge>
          </div>
        </div>
      </div>

      <div className='admin-group-card__body flex flex-1 flex-col divide-y divide-border/40 rounded-xl bg-muted/30 px-3 py-1 sm:px-4'>
        <DetailRow label='Kurs' value={courseName} />
        <DetailRow label='Ustoz' value={teacherName} />
        <DetailRow label='Kunlar' value={formatWeekDays(group)} />
        <DetailRow
          label='Vaqt'
          value={
            <span className='inline-flex items-center justify-end gap-1.5'>
              <Clock className='hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:inline' />
              {formatSchedule(group)}
            </span>
          }
        />
        <DetailRow
          label="O'quvchi"
          value={`${studentCount} ta`}
          valueClassName='text-primary'
        />
      </div>
    </article>
  )
}
