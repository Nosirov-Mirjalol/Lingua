import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RoseButton } from '@/components/ui/rose-button'
import { cn } from '@/lib/utils'

// ─── types ─────────────────────────────────────────────────────────

type Status = 'active' | 'inactive' | 'archived'

export interface NewGroup {
  name?: string
  description?: string
  course?: number
  teacher?: number
  start_time?: string
  end_time?: string
  week_days?: string // "Mon,Wed,Fri"
  status?: Status
  start_date?: string // "YYYY-MM-DD"
  end_date?: string // "YYYY-MM-DD"
  room?: string
  students?: number
}

interface GroupModalProps {
  isOpen: boolean
  onClose: () => void
  onAddGroup: () => void
  newGroup: Record<string, unknown>
  setNewGroup: React.Dispatch<React.SetStateAction<any>>
}

// ─── constants ─────────────────────────────────────────────────────

const WEEK_DAYS = [
  { label: 'Du', value: 'Mon' },
  { label: 'Se', value: 'Tue' },
  { label: 'Ch', value: 'Wed' },
  { label: 'Pa', value: 'Thu' },
  { label: 'Ju', value: 'Fri' },
  { label: 'Sh', value: 'Sat' },
  { label: 'Ya', value: 'Sun' },
]

// ─── helpers ───────────────────────────────────────────────────────

/**
 * "2024-10-05" → Date (timezone xatosiz)
 */
function parseDateSafe(value: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d) // local timezone, UTC offset yo'q
}

/**
 * Date → "YYYY-MM-DD"
 */
function formatDateValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── sub-components ────────────────────────────────────────────────

function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      {children}
    </div>
  )
}

function DatePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const selected = parseDateSafe(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          {selected ? format(selected, 'dd.MM.yyyy') : 'Tanlang'}
          <CalendarIcon size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => onChange(date ? formatDateValue(date) : '')}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

function WeekDayPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const selected = value ? value.split(',').filter(Boolean) : []

  const toggle = (day: string) => {
    const next = selected.includes(day)
      ? selected.filter((d) => d !== day)
      : [...selected, day]
    // hafta tartibida saqlash
    onChange(WEEK_DAYS.map((d) => d.value).filter((d) => next.includes(d)).join(','))
  }

  return (
    <div className="flex gap-1.5">
      {WEEK_DAYS.map(({ label, value: day }) => {
        const active = selected.includes(day)
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={cn(
              'flex-1 py-1.5 rounded-md text-xs font-semibold border transition-colors',
              active
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ─── main ──────────────────────────────────────────────────────────

export function GroupModal({
  isOpen,
  onClose,
  onAddGroup,
  newGroup,
  setNewGroup,
}: GroupModalProps) {
  if (!isOpen) return null

  const group = newGroup as Partial<NewGroup>

  const set = <K extends keyof NewGroup>(key: K, value: NewGroup[K]) =>
    setNewGroup((prev: Record<string, unknown>) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddGroup()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background w-[90%] max-w-[500px] max-h-[90vh] overflow-auto rounded-2xl p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Yangi Guruh Qo&apos;shish</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Guruh nomi *">
            <Input
              value={group.name ?? ''}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Masalan: IELTS 7.5 Morning"
              required
            />
          </FormField>

          <FormField label="Kurs *">
            <Input
              type="number"
              value={group.course ?? ''}
              onChange={(e) => set('course', parseInt(e.target.value) || 0)}
              placeholder="Kurs ID"
              required
            />
          </FormField>

          <FormField label="O'qituvchi *">
            <Input
              type="number"
              value={group.teacher ?? ''}
              onChange={(e) => set('teacher', parseInt(e.target.value) || 0)}
              placeholder="O'qituvchi ID"
              required
            />
          </FormField>

          {/* Vaqt */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Boshlanish vaqti *">
              <Input
                type="time"
                value={group.start_time ?? ''}
                onChange={(e) => set('start_time', e.target.value)}
                required
                className="[&::-webkit-calendar-picker-indicator]:hidden"
              />
            </FormField>

            <FormField label="Tugash vaqti *">
              <Input
                type="time"
                value={group.end_time ?? ''}
                onChange={(e) => set('end_time', e.target.value)}
                required
                className="[&::-webkit-calendar-picker-indicator]:hidden"
              />
            </FormField>
          </div>

          {/* Hafta kunlari */}
          <FormField label="Hafta kunlari *">
            <WeekDayPicker
              value={group.week_days ?? ''}
              onChange={(v) => set('week_days', v)}
            />
          </FormField>

          <FormField label="Holat *">
            <Select
              value={group.status ?? 'active'}
              onValueChange={(v) => set('status', v as Status)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {/* Sanalar */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Boshlanish sanasi *">
              <DatePicker
                value={group.start_date ?? ''}
                onChange={(v) => set('start_date', v)}
              />
            </FormField>

            <FormField label="Tugash sanasi *">
              <DatePicker
                value={group.end_date ?? ''}
                onChange={(v) => set('end_date', v)}
              />
            </FormField>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Bekor qilish
            </Button>
            <RoseButton type="submit" className="flex-1">
              Guruh qo&apos;shish
            </RoseButton>
          </div>
        </form>
      </div>
    </div>
  )
}
