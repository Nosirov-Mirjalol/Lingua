import { useState } from 'react'
import { Download, X, Calendar, TrendingUp } from 'lucide-react'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { RoseButton } from '@/components/ui/rose-button'

// ─── Types ────────────────────────────────────────────────────────────────────

type GroupDetailsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Student = {
  id: string
  initials: string
  name: string
  status: 'paid' | 'debt'
  attendance: number
  rating: number
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const GROUP_INFO = {
  name: 'Elementary 104',
  code: '#GP-EL-104',
  startDate: '15-Oktabr, 2023',
  avgScore: '78.4%',
  schedule: 'Mon, Wed, Fri • 09:00 – 11:00',
}

const STUDENTS: Student[] = [
  {
    id: '1',
    initials: 'AS',
    name: 'Anvar Sobirov',
    status: 'paid',
    attendance: 92,
    rating: 5,
  },
  {
    id: '2',
    initials: 'MR',
    name: 'Malika Rahmonova',
    status: 'paid',
    attendance: 100,
    rating: 5,
  },
  {
    id: '3',
    initials: 'JK',
    name: 'Jasur Karimov',
    status: 'debt',
    attendance: 65,
    rating: 5,
  },
]

const DEFAULT_NOTES =
  "Guruhda faollik yuqori. Bugun 3 nafar o'quvchi sababli darsga kela olmadi. Uyga vazifalar tekshirildi.\n\nOxirgi yangilanish: 2 soat avval"

const TABLE_COLS = ['F.I.SH', 'HOLAT', 'DAVOMAT', 'REYTING'] as const

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className='flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm'>
      <div className='grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600'>
        {icon}
      </div>
      <div>
        <p className='text-[10px] font-bold tracking-[0.12em] text-slate-400 uppercase'>
          {label}
        </p>
        <p className='text-sm font-extrabold text-slate-900'>{value}</p>
      </div>
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < rating ? 'text-rose-500' : 'text-slate-200'}
          style={{ fontSize: 15 }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function StudentRow({ student }: { student: Student }) {
  const paid = student.status === 'paid'
  return (
    <div className='grid grid-cols-[2fr_1fr_1fr_1.4fr] items-center gap-6 px-6 py-4 transition-colors hover:bg-slate-50'>
      <div className='flex items-center gap-3'>
        <div className='grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-rose-50 text-xs font-extrabold text-rose-600'>
          {student.initials}
        </div>
        <p className='text-sm font-bold text-slate-900'>{student.name}</p>
      </div>

      <div className='flex items-center gap-2'>
        <span
          className={`h-2 w-2 flex-shrink-0 rounded-full ${paid ? 'bg-emerald-500' : 'bg-amber-400'}`}
        />
        <p
          className={`text-xs font-bold ${paid ? 'text-emerald-600' : 'text-amber-500'}`}
        >
          {paid ? "To'langan" : 'Qarzdorlik'}
        </p>
      </div>

      <p className='text-sm font-bold text-slate-700'>{student.attendance}%</p>

      <StarRating rating={student.rating} />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GroupDetailsModal({
  open,
  onOpenChange,
}: GroupDetailsModalProps) {
  const [notes, setNotes] = useState(DEFAULT_NOTES)

  const handleClose = () => onOpenChange(false)
  const handleExport = () => {
    // TODO: export to PDF
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex h-[90vh] max-h-[calc(100vh-32px)] w-[95vw] !max-w-[1100px] flex-col gap-0 overflow-hidden rounded-[28px] border-0 bg-white p-0 shadow-[0_32px_80px_-20px_rgba(2,6,23,0.3)] md:h-[700px] md:flex-row [&>button.absolute]:hidden'>
        {/* ── Left Panel ── */}
        <div className='flex w-full flex-shrink-0 flex-col gap-5 overflow-y-auto border-b border-slate-200 bg-slate-50 px-6 py-6 md:w-[320px] md:border-r md:border-b-0 md:px-7 md:py-8'>
          <div>
            <p className='text-[10px] font-extrabold tracking-[0.16em] text-rose-600 uppercase'>
              GURUH TAFSILOTLARI
            </p>
            <p className='mt-2 text-2xl font-extrabold text-slate-900'>
              {GROUP_INFO.name}
            </p>
            <p className='mt-1 text-xs font-semibold text-slate-400'>
              ID: {GROUP_INFO.code}
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <MetaCard
              icon={<Calendar size={16} />}
              label='BOSHLANISH SANASI'
              value={GROUP_INFO.startDate}
            />
            <MetaCard
              icon={<TrendingUp size={16} />}
              label="O'RTACHA O'ZLASHTIRISH"
              value={GROUP_INFO.avgScore}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <p className='text-[10px] font-extrabold tracking-[0.16em] text-rose-600 uppercase'>
              DAVOMAT QAYDLARI
            </p>
            <div className='rounded-2xl bg-white p-4 shadow-sm'>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                className='w-full resize-none bg-transparent text-xs leading-relaxed font-medium text-slate-600 outline-none'
              />
            </div>
          </div>
        </div>
        {/* ── Right Panel ── */}
        <div className='flex h-full flex-1 flex-col overflow-hidden px-6 py-6 md:px-8 md:py-8'>
          {/* Header */}
          <div className='flex flex-shrink-0 items-center justify-between'>
            <h2 className='text-xl font-extrabold text-slate-900'>
              O'quvchilar Ro'yxati
            </h2>
            <div className='flex items-center gap-3'>
              <RoseButton
                type='button'
                onClick={handleExport}
                roseVariant='ghost'
                roseSize='sm'
                className='inline-flex items-center gap-2 text-xs font-extrabold'
              >
                <Download size={14} />
                Eksport (.pdf)
              </RoseButton>
              <DialogClose asChild>
                <button
                  type='button'
                  className='grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200'
                >
                  <X size={15} />
                </button>
              </DialogClose>
            </div>
          </div>

          {/* Table — flex-1 + min-h-0 key for proper stretch */}
          <div className='mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 shadow-sm md:mt-5'>
            <div className='flex flex-1 flex-col overflow-x-auto'>
              <div className='flex min-w-[600px] flex-1 flex-col'>
                {/* Head */}
                <div className='grid flex-shrink-0 grid-cols-[2fr_1fr_1fr_1.4fr] gap-6 border-b border-slate-100 bg-white px-6 py-3.5'>
                  {TABLE_COLS.map((col) => (
                    <p
                      key={col}
                      className='text-[10px] font-extrabold tracking-[0.16em] text-slate-400 uppercase'
                    >
                      {col}
                    </p>
                  ))}
                </div>

                {/* Body */}
                <div className='flex-1 divide-y divide-slate-100 overflow-y-auto bg-white'>
                  {STUDENTS.map((s) => (
                    <StudentRow key={s.id} student={s} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className='mt-4 flex flex-shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center md:mt-5'>
            <RoseButton
              type='button'
              onClick={handleClose}
              className='h-12 w-full rounded-full text-sm font-extrabold sm:w-auto sm:flex-1'
              roseVariant='gradient'
            >
              Darsni Boshlash
            </RoseButton>
            <RoseButton
              type='button'
              onClick={handleClose}
              roseVariant='outline'
              roseSize='lg'
              className='h-12 w-full text-sm font-extrabold sm:w-auto sm:flex-1'
            >
              Vazifa Yuklash
            </RoseButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
