import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Check, ChevronDown, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { AttendanceStatus } from '@/api/service/teacher/attendance.type'
import { useAttendanceList } from '@/hooks/teacher/attendance/useAttendanceList'
import { useGroupAttendance } from '@/hooks/teacher/attendance/useGroupAttendance'
import { useTeacherGroups } from '@/hooks/teacher/groups/useTeacherGroups'
import { useProfile } from '@/hooks/teacher/profile/useProfile'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RoseButton } from '@/components/ui/rose-button'

export const Route = createFileRoute(
  '/_authenticated/teacher-dashboard/attendance'
)({
  component: AttendancePage,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStudent = {
  attendanceId?: number
  studentId: number
  name: string
  status: AttendanceStatus
  note: string
}

type SaveState = 'idle' | 'saving' | 'saved'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const formatDate = (d: Date) =>
  `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

const pickStudentDisplayName = (studentId: number, studentName?: string) => {
  const n = studentName?.trim()
  if (!n) return `Student #${studentId}`
  const words = n.split(/\s+/).filter(Boolean)
  const hasLetters = /[a-zA-Z\p{L}]/u.test(n)
  const looksLikeFullName = hasLetters && words.length >= 2
  return looksLikeFullName ? n : `Student #${studentId}`
}

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-500 text-white',
  absent: 'bg-rose-500 text-white',
  late: 'bg-slate-800 text-white',
}

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'late']

// ─── Main Component ───────────────────────────────────────────────────────────

function AttendancePage() {
  const [selectedGroupId, setSelectedGroupId] = useState(0)
  const [groupOpen, setGroupOpen] = useState(false)
  const [date, setDate] = useState<Date>(() => new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [students, setStudents] = useState<AttendanceStudent[]>([])
  const [savedStudents, setSavedStudents] = useState<AttendanceStudent[]>([])

  const isoDate = useMemo(() => toISODate(date), [date])

  const { data: profile } = useProfile()
  const { data: groups = [], isLoading: groupsLoading } = useTeacherGroups()
  const { data: attendanceList = [] } = useAttendanceList()

  const filteredGroups = useMemo(() => {
    const teacherId = profile?.id
    if (!teacherId) return groups
    return groups.filter((g) => g.teacher === teacherId)
  }, [groups, profile?.id])

  useEffect(() => {
    if (!filteredGroups.length) {
      setSelectedGroupId(0)
      return
    }
    const selectedExists = filteredGroups.some((g) => g.id === selectedGroupId)
    if (!selectedExists) {
      setSelectedGroupId(filteredGroups[0].id)
    }
  }, [filteredGroups, selectedGroupId])

  const groupId = selectedGroupId || filteredGroups[0]?.id || 0
  const groupData = filteredGroups.find((g) => g.id === groupId)

  const groupAttendanceMutation = useGroupAttendance(groupId)

  // ── derivedStudents: API dan kelgan status + note ni ishlatadi ─────────────
  // Agar shu kun uchun attendance yozuvi mavjud bo'lsa → existing.status
  // Agar yo'q bo'lsa (yangi kun) → 'present' default

  const derivedStudents = useMemo<AttendanceStudent[]>(() => {
    if (!groupData) return []

    const byStudentId = new Map(
      attendanceList
        .filter((a) => a.group === groupId && a.date === isoDate)
        .map((a) => [a.student, a])
    )

    return groupData.students.map(({ student }) => {
      const existing = byStudentId.get(student)
      return {
        attendanceId: existing?.id,
        studentId: student,
        name: pickStudentDisplayName(student, existing?.student_name),
        // API dan kelgan status ishlatiladi, yo'q bo'lsa 'present'
        status: existing?.status ?? 'present',
        note: existing?.note ?? '',
      }
    })
  }, [groupData, attendanceList, groupId, isoDate])

  // ── Sync: derivedStudents → local state ────────────────────────────────────
  // MUHIM: agar attendanceId mavjud (API yozuvi bor) → base.status ishlatiladi
  // agar attendanceId yo'q (yangi student, yozuv yo'q) → prev.status (user o'zgartirgan) saqlanadi

  useEffect(() => {
    setStudents((prev) => {
      if (!derivedStudents.length) return []
      const prevMap = new Map(prev.map((s) => [s.studentId, s]))
      return derivedStudents.map((base) => {
        const p = prevMap.get(base.studentId)
        // Agar API dan yozuv kelgan bo'lsa (attendanceId bor) → API statusini ishlatamiz
        // Agar yozuv yo'q va user allaqachon o'zgartirgan bo'lsa → prev statusni saqlaymiz
        if (base.attendanceId !== undefined) {
          return base
        }
        return p ? { ...base, status: p.status, note: p.note } : base
      })
    })
  }, [derivedStudents])

  useEffect(() => {
    setSavedStudents(derivedStudents)
  }, [derivedStudents])

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = savedStudents.length
    const present = savedStudents.filter((s) => s.status === 'present').length
    const absent = savedStudents.filter((s) => s.status === 'absent').length
    const late = savedStudents.filter((s) => s.status === 'late').length
    const pct = total ? Math.round((present / total) * 100) : 0
    return { total, present, absent, late, pct }
  }, [savedStudents])

  // ── Search ────────────────────────────────────────────────────────────────

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return q
      ? students.filter((s) => s.name.toLowerCase().includes(q))
      : students
  }, [searchQuery, students])

  // ── Setters ───────────────────────────────────────────────────────────────

  const setStatus = (studentId: number, status: AttendanceStatus) =>
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    )

  const setNote = (studentId: number, note: string) =>
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, note } : s))
    )

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (saveState === 'saving' || !groupId) return
    setSaveState('saving')
    try {
      await toast.promise(
        groupAttendanceMutation.mutateAsync({
          date: isoDate,
          records: students.map((s) => ({
            student: s.studentId,
            status: s.status,
            note: s.note || undefined,
          })),
        }),
        { loading: 'Saving...', success: 'Saved', error: 'Error' }
      )
      setSavedStudents(students)
      setSaveState('saved')
      window.setTimeout(() => setSaveState('idle'), 1300)
    } catch {
      setSaveState('idle')
    }
  }

  // ── Circular progress ─────────────────────────────────────────────────────

  const radius = 45
  const stroke = 9
  const circumference = 2 * Math.PI * radius
  const dashOffset =
    circumference -
    (Math.max(0, Math.min(100, stats.pct)) / 100) * circumference

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className='mx-auto max-w-7xl space-y-4 p-4 text-slate-900'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Attendance</h1>
          <p className='text-sm text-slate-500'>
            Manage student presence and notes
          </p>
        </div>
        <div className='relative w-full sm:w-64'>
          <Search
            className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400'
            size={16}
          />
          <input
            type='text'
            placeholder='Search student...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='h-10 w-full rounded-lg border-none bg-slate-100 pr-4 pl-9 text-base transition-all focus:ring-1 focus:ring-rose-500'
          />
        </div>
      </div>

      {/* Stats Panel */}
      <div className='grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-12'>
        <div className='flex items-center justify-center border-r border-slate-100 pr-4 md:col-span-3'>
          <div className='relative flex items-center justify-center'>
            <svg width='110' height='110' className='-rotate-90'>
              <circle
                cx='55'
                cy='55'
                r={radius}
                fill='none'
                stroke='#f1f5f9'
                strokeWidth={stroke}
              />
              <circle
                cx='55'
                cy='55'
                r={radius}
                fill='none'
                stroke='#e11d48'
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap='round'
                className='transition-all duration-700 ease-out'
              />
            </svg>
            <div className='absolute flex flex-col items-center'>
              <span className='text-2xl font-bold'>{stats.pct}%</span>
              <span className='text-xs font-bold tracking-widest text-slate-400 uppercase'>
                Present
              </span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 items-center gap-4 pl-2 md:col-span-9 lg:grid-cols-4'>
          {(
            [
              {
                label: 'Present',
                val: stats.present,
                color: 'text-emerald-600',
              },
              { label: 'Absent', val: stats.absent, color: 'text-rose-600' },
              { label: 'Late', val: stats.late, color: 'text-amber-600' },
              { label: 'Total', val: stats.total, color: 'text-slate-600' },
            ] as const
          ).map(({ label, val, color }) => (
            <div key={label}>
              <p className='text-xs font-bold tracking-widest text-slate-400 uppercase'>
                {label}
              </p>
              <p className={`text-3xl font-bold ${color}`}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className='flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3'>
        {/* Group Selector */}
        <div className='min-w-52 flex-1'>
          <label className='mb-1 block text-xs font-bold text-slate-400 uppercase'>
            Group
          </label>
          <div className='relative'>
            <button
              type='button'
              onClick={() => setGroupOpen(!groupOpen)}
              disabled={groupsLoading}
              className='flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 px-3 text-base transition-colors hover:bg-slate-50 disabled:opacity-50'
            >
              <span className='truncate'>
                {groupsLoading
                  ? 'Loading...'
                  : (groupData?.name ?? 'Select group')}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${groupOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {groupOpen && (
              <div className='absolute top-full left-0 z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-xl'>
                {filteredGroups.map((g) => (
                  <button
                    key={g.id}
                    type='button'
                    onClick={() => {
                      setSelectedGroupId(g.id)
                      setGroupOpen(false)
                    }}
                    className='flex w-full justify-between px-3 py-2 text-left text-base hover:bg-slate-50'
                  >
                    <span>{g.name}</span>
                    <span className='text-sm text-slate-400'>
                      {g.students.length} students
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Picker */}
        <div className='min-w-52 flex-1'>
          <label className='mb-1 block text-xs font-bold text-slate-400 uppercase'>
            Session Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type='button'
                className='flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 px-3 text-base hover:bg-slate-50'
              >
                <span className='flex items-center gap-2'>
                  <Calendar size={16} /> {formatDate(date)}
                </span>
                <ChevronDown size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <CalendarPicker
                mode='single'
                selected={date}
                onSelect={(d) => d && setDate(d)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <RoseButton
          type='button'
          onClick={handleSave}
          roseVariant='solid'
          disabled={saveState === 'saving' || !groupId || students.length === 0}
          className='h-10 px-6 text-base font-medium'
        >
          {saveState === 'saving' ? (
            <Loader2 size={18} className='animate-spin' />
          ) : saveState === 'saved' ? (
            <Check size={18} />
          ) : (
            'Save Attendance'
          )}
        </RoseButton>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-left text-sm'>
            <thead className='border-b border-slate-200 bg-slate-50'>
              <tr>
                {['#', 'Student Name', 'Attendance', 'Note'].map((h) => (
                  <th
                    key={h}
                    className='px-4 py-3 text-xs font-bold text-slate-500 uppercase'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className='px-4 py-10 text-center text-slate-400'
                  >
                    {groupsLoading
                      ? 'Loading groups...'
                      : filteredGroups.length === 0
                        ? 'No groups assigned to you'
                        : 'No students found'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr
                    key={s.studentId}
                    className='transition-colors hover:bg-slate-50/50'
                  >
                    <td className='px-4 py-3 font-medium text-slate-400'>
                      {idx + 1}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700'>
                          {getInitials(s.name)}
                        </div>
                        <span className='text-base font-semibold text-slate-800'>
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex gap-1'>
                        {STATUSES.map((st) => (
                          <button
                            key={st}
                            type='button'
                            onClick={() => setStatus(s.studentId, st)}
                            className={`rounded px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                              s.status === st
                                ? STATUS_STYLES[st]
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='text'
                        value={s.note}
                        placeholder='Add note...'
                        onChange={(e) => setNote(s.studentId, e.target.value)}
                        disabled={s.status !== 'late'}
                        className='h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm outline-none focus:ring-1 focus:ring-rose-500 disabled:opacity-30'
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
