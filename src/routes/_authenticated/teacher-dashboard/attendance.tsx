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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RoseButton } from '@/components/ui/rose-button'

export const Route = createFileRoute('/_authenticated/teacher-dashboard/attendance')({
  component: AttendancePage,
})

type AttendanceStudent = {
  attendanceId?: number
  studentId: number
  name: string
  status: AttendanceStatus
  note: string
}

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-500 text-white',
  absent: 'bg-rose-500 text-white',
  late: 'bg-slate-800 dark:bg-slate-700 text-white',
}

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'late']

function AttendancePage() {
  const [selectedGroupId, setSelectedGroupId] = useState(0)
  const [groupOpen, setGroupOpen] = useState(false)
  const [date, setDate] = useState<Date>(() => new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  
  // students - ekrandagi o'zgarishlar uchun, savedStudents - faqat saqlangan (API) holat va statistika uchun
  const [students, setStudents] = useState<AttendanceStudent[]>([])
  const [savedStudents, setSavedStudents] = useState<AttendanceStudent[]>([])

  const isoDate = useMemo(() => toISODate(date), [date])
  const { data: profile } = useProfile()
  const { data: groups = [], isLoading: groupsLoading } = useTeacherGroups()
  const { data: attendanceList = [] } = useAttendanceList()

  const filteredGroups = useMemo(() => {
    if (!profile?.id) return groups
    return groups.filter((g) => g.teacher === profile.id)
  }, [groups, profile?.id])

  useEffect(() => {
    if (filteredGroups.length && !filteredGroups.some(g => g.id === selectedGroupId)) {
      setSelectedGroupId(filteredGroups[0].id)
    }
  }, [filteredGroups, selectedGroupId])

  const groupId = selectedGroupId || filteredGroups[0]?.id || 0
  const groupData = filteredGroups.find((g) => g.id === groupId)
  const groupAttendanceMutation = useGroupAttendance(groupId)

  // API dan kelgan ma'lumotlarni yig'ish
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
        name: existing?.student_name?.trim() || `Student #${student}`,
        status: existing?.status ?? 'present',
        note: existing?.note ?? '',
      }
    })
  }, [groupData, attendanceList, groupId, isoDate])

  // Ma'lumotlar o'zgarganda statelarni yangilash
  useEffect(() => {
    setStudents(derivedStudents)
    setSavedStudents(derivedStudents) // Statistika faqat shu saqlangan holatdan hisoblanadi
  }, [derivedStudents])

  // Statistika faqat saqlangan (savedStudents) talabalardan hisoblanadi
  const stats = useMemo(() => {
    const total = savedStudents.length
    const present = savedStudents.filter((s) => s.status === 'present').length
    const absent = savedStudents.filter((s) => s.status === 'absent').length
    const late = savedStudents.filter((s) => s.status === 'late').length
    const pct = total ? Math.round((present / total) * 100) : 0
    return { total, present, absent, late, pct }
  }, [savedStudents])

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return q ? students.filter((s) => s.name.toLowerCase().includes(q)) : students
  }, [searchQuery, students])

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
      setSavedStudents(students) // Saqlash muvaffaqiyatli bo'lgach statistika yangilanadi
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1300)
    } catch {
      setSaveState('idle')
    }
  }

  // Progress Bar Animatsiyasi (O'chirilgani yo'q)
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (Math.max(0, Math.min(100, stats.pct)) / 100) * circumference

  return (
    <div className='mx-auto max-w-7xl space-y-4 p-4 text-slate-900 dark:text-slate-100'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Attendance</h1>
          <p className='text-sm text-slate-500'>Manage student presence</p>
        </div>
        <div className='relative w-full sm:w-64'>
          <Search className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400' size={16} />
          <input
            type='text'
            placeholder='Search student...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-800 pr-4 pl-9 text-base focus:ring-1 focus:ring-rose-500 outline-none border-none'
          />
        </div>
      </div>

      {/* Stats Panel */}
      <div className='grid grid-cols-1 gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:grid-cols-12'>
        <div className='flex items-center justify-center border-r border-slate-100 md:col-span-3'>
          <div className='relative flex items-center justify-center'>
            <svg width='110' height='110' className='-rotate-90'>
              <circle cx='55' cy='55' r={radius} fill='none' stroke='currentColor' strokeWidth={9} className='text-slate-100 dark:text-slate-800' />
              <circle
                cx='55' cy='55' r={radius} fill='none' stroke='#e11d48' strokeWidth={9}
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                strokeLinecap='round' className='transition-all duration-700 ease-out' // Animatsiya saqlandi
              />
            </svg>
            <div className='absolute flex flex-col items-center'>
              <span className='text-2xl font-bold'>{stats.pct}%</span>
              <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>Present</span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 items-center gap-4 pl-2 md:col-span-9 lg:grid-cols-4'>
          {[
            { label: 'Present', val: stats.present, color: 'text-emerald-600' },
            { label: 'Absent', val: stats.absent, color: 'text-rose-600' },
            { label: 'Late', val: stats.late, color: 'text-amber-600' },
            { label: 'Total', val: stats.total, color: 'text-slate-600' },
          ].map(({ label, val, color }) => (
            <div key={label}>
              <p className='text-xs font-bold tracking-widest text-slate-400 uppercase'>{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className='flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3'>
        <div className='min-w-52 flex-1'>
          <label className='mb-1 block text-xs font-bold text-slate-400 uppercase'>Group</label>
          <div className='relative'>
            <button
              type='button' onClick={() => setGroupOpen(!groupOpen)} disabled={groupsLoading}
              className='flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-base'
            >
              <span className='truncate'>{groupsLoading ? 'Loading...' : (groupData?.name ?? 'Select group')}</span>
              <ChevronDown size={16} className={groupOpen ? 'rotate-180' : ''} />
            </button>
            {groupOpen && (
              <div className='absolute top-full left-0 z-20 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl'>
                {filteredGroups.map((g) => (
                  <button
                    key={g.id} type='button'
                    onClick={() => { setSelectedGroupId(g.id); setGroupOpen(false) }}
                    className='flex w-full justify-between px-3 py-2 text-left text-base hover:bg-slate-50 dark:hover:bg-slate-800'
                  >
                    <span>{g.name}</span>
                    <span className='text-sm text-slate-400'>{g.students.length} students</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='min-w-52 flex-1'>
          <label className='mb-1 block text-xs font-bold text-slate-400 uppercase'>Session Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <button type='button' className='flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-base'>
                <span className='flex items-center gap-2'><Calendar size={16} /> {formatDate(date)}</span>
                <ChevronDown size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <CalendarPicker mode='single' selected={date} onSelect={(d) => d && setDate(d)} />
            </PopoverContent>
          </Popover>
        </div>

        <RoseButton
          type='button' onClick={handleSave} roseVariant='solid'
          disabled={saveState === 'saving' || !groupId || students.length === 0}
          className='h-10 px-6 text-base font-medium'
        >
          {saveState === 'saving' ? <Loader2 size={18} className='animate-spin' /> : saveState === 'saved' ? <Check size={18} /> : 'Save Attendance'}
        </RoseButton>
      </div>

      {/* Responsive List View */}
      <div className='space-y-3'>
        {filteredStudents.length === 0 ? (
          <div className='rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-center text-slate-400'>
            {groupsLoading ? 'Loading groups...' : filteredGroups.length === 0 ? 'No groups assigned to you' : 'No students found'}
          </div>
        ) : (
          filteredStudents.map((s, idx) => (
            <div key={s.studentId} className='flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm'>
              
              {/* Ism va ma'lumotlar */}
              <div className='flex items-center justify-between md:w-auto md:flex-1'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950 text-xs font-bold text-rose-700 dark:text-rose-300'>
                    {getInitials(s.name)}
                  </div>
                  <div>
                    <span className='text-base font-semibold text-slate-800 dark:text-slate-200'>{s.name}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-300 md:hidden">{String(idx + 1).padStart(2, '0')}</span>
              </div>

              {/* Tugmalar va Note input */}
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto'>
                <div className='flex gap-1 flex-1 sm:flex-initial'>
                  {STATUSES.map((st) => (
                    <button
                      key={st} type='button'
                      onClick={() => setStudents(prev => prev.map(p => p.studentId === s.studentId ? { ...p, status: st } : p))}
                      className={`flex-1 md:w-24 rounded px-3 py-2 text-xs font-bold uppercase transition-all ${
                        s.status === st ? STATUS_STYLES[st] : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <input
                  type='text' value={s.note} placeholder='Add note...'
                  onChange={(e) => setStudents(prev => prev.map(p => p.studentId === s.studentId ? { ...p, note: e.target.value } : p))}
                  disabled={s.status !== 'late'}
                  className='h-9 w-full sm:w-40 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 text-sm outline-none focus:ring-1 focus:ring-rose-500 disabled:opacity-30'
                />

                <span className="hidden md:block text-xs font-bold text-slate-300 w-6 text-right">{String(idx + 1).padStart(2, '0')}</span>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}