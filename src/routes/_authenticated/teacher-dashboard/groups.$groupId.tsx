import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Loader2, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useAddStudentToGroup } from '@/hooks/teacher/groups/useAddStudentToGroup'
import { useRemoveStudentFromGroup } from '@/hooks/teacher/groups/useRemoveStudentFromGroup'
import { useTeacherGroups } from '@/hooks/teacher/groups/useTeacherGroups'
import { useStudents } from '@/hooks/teacher/students/useStudents'
import { formatDisplayDate } from '@/lib/date-format'
import { RoseButton } from '@/components/ui/rose-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const pickStudentDisplayName = (
  studentId: number,
  candidate?: string | null
): string => {
  const n = candidate?.trim()
  return n ? n : `Student #${studentId}`
}

export const Route = createFileRoute(
  '/_authenticated/teacher-dashboard/groups/$groupId'
)({
  component: GroupDetailPage,
})

function GroupDetailPage() {
  const { groupId } = Route.useParams()
  const numericGroupId = Number(groupId)

  const [selectedStudentUsername, setSelectedStudentUsername] = useState('')
  const [removingStudentId, setRemovingStudentId] = useState<number | null>(
    null
  )

  const { data: groups = [], isLoading: isLoadingGroups } = useTeacherGroups()
  const group = useMemo(
    () => groups.find((g) => g.id === numericGroupId),
    [groups, numericGroupId]
  )

  const {
    data: availableStudents = [],
    isLoading: isLoadingStudents,
    isError: isErrorStudents,
  } = useStudents(numericGroupId)

  const addStudentMutation = useAddStudentToGroup(numericGroupId)
  const removeStudentMutation = useRemoveStudentFromGroup(numericGroupId)

  const handleAddStudent = () => {
    const username = selectedStudentUsername.trim()
    if (!username) return

    toast.promise(addStudentMutation.mutateAsync({ username }), {
      loading: 'Adding student...',
      success: (res) => res.detail || 'Student added successfully',
      error: 'Failed to add student',
    })

    setSelectedStudentUsername('')
  }

  const handleRemoveStudent = async (studentId: number) => {
    setRemovingStudentId(studentId)

    try {
      await toast.promise(removeStudentMutation.mutateAsync(studentId), {
        loading: 'Removing student...',
        success: (res) => res.detail || 'Student removed successfully',
        error: 'Failed to remove student',
      })
    } finally {
      setRemovingStudentId((current) =>
        current === studentId ? null : current
      )
    }
  }

  if (Number.isNaN(numericGroupId)) {
    return (
      <div className='mx-auto max-w-4xl px-4 py-6'>
        <p className='text-sm text-rose-700'>Invalid group id</p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-4xl px-4 py-6'>
      <div className='mb-6 flex items-center gap-3'>
        <Link
          to='/teacher-dashboard/groups'
          className='inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          aria-label='Back to groups'
        >
          <ArrowLeft size={18} />
        </Link>

        <div className='min-w-0'>
          <h1 className='truncate text-xl font-bold text-slate-900'>
            Manage Students
          </h1>
          <p className='truncate text-sm text-slate-500'>
            {isLoadingGroups
              ? 'Loading group...'
              : group
                ? group.name
                : 'Group not found'}
          </p>
        </div>
      </div>

      <div className='rounded-lg border border-slate-200 bg-white p-4'>
        <h2 className='mb-3 text-sm font-semibold text-slate-900'>
          Add student
        </h2>

        <div className='flex flex-col gap-3 sm:flex-row'>
          <div className='flex-1'>
            <Select
              value={selectedStudentUsername}
              onValueChange={setSelectedStudentUsername}
            >
              <SelectTrigger className='h-10 w-full rounded-md'>
                <SelectValue placeholder='Select a student...' />
              </SelectTrigger>
              <SelectContent>
                {isLoadingStudents ? (
                  <div className='p-3 text-sm text-slate-500'>Loading...</div>
                ) : isErrorStudents ? (
                  <div className='p-3 text-sm text-rose-600'>
                    Error loading students
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className='p-3 text-sm text-slate-500'>
                    No available students
                  </div>
                ) : (
                  availableStudents.map((s) => (
                    <SelectItem key={s.id} value={s.username}>
                      {pickStudentDisplayName(s.id, s.full_name ?? s.username)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <RoseButton
            type='button'
            roseVariant='solid'
            className='h-10 rounded-md px-4 text-sm font-semibold'
            disabled={addStudentMutation.isPending || !selectedStudentUsername}
            onClick={handleAddStudent}
          >
            {addStudentMutation.isPending ? (
              <Loader2 size={18} className='animate-spin' />
            ) : (
              'Add'
            )}
          </RoseButton>
        </div>
      </div>

      <div className='mt-6 rounded-lg border border-slate-200 bg-white'>
        <div className='flex items-center justify-between border-b border-slate-200 p-4'>
          <h2 className='text-sm font-semibold text-slate-900'>Students</h2>
          <div className='flex items-center gap-2 text-sm text-slate-600'>
            <Users size={16} />
            <span>{group?.students.length ?? 0}</span>
          </div>
        </div>

        {!group ? (
          <div className='p-4 text-sm text-slate-600'>
            {isLoadingGroups ? 'Loading...' : 'Group not found'}
          </div>
        ) : group.students.length === 0 ? (
          <div className='p-4 text-sm text-slate-600'>
            No students in this group.
          </div>
        ) : (
          <div className='p-4'>
            <div className='space-y-2'>
              {group.students.map((s) => (
                <div
                  key={s.id}
                  className='flex items-center justify-between rounded-md border border-slate-200 px-3 py-2'
                >
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium text-slate-900'>
                      {pickStudentDisplayName(
                        s.student,
                        s.full_name ?? s.student_name ?? s.username
                      )}
                    </p>
                    <p className='text-xs text-slate-500'>
                      Joined: {formatDisplayDate(s.joined_at) || 'Mavjud emas'}
                    </p>
                  </div>

                  <button
                    type='button'
                    className='inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50'
                    onClick={() => handleRemoveStudent(s.student)}
                    disabled={removingStudentId === s.student}
                  >
                    {removingStudentId === s.student ? (
                      <Loader2 size={16} className='animate-spin' />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
