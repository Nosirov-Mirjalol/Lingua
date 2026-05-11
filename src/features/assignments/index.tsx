import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AssignmentsTable } from './components/assignments-table'
import { AssignmentsEmptyState } from './components/empty-state'
import { AssignmentsErrorBoundary } from './components/error-boundary'
import { AssignmentsLoadingSkeleton } from './components/loading-skeleton'
import {
  useAssignments,
  useCreateAssignment,
  useDeleteAssignment,
  useUpdateAssignment,
} from './hooks'

export default function AssignmentsPage() {
  const { data: assignments, isLoading, error } = useAssignments()
  const createAssignmentMutation = useCreateAssignment()
  const updateAssignmentMutation = useUpdateAssignment()
  const deleteAssignmentMutation = useDeleteAssignment()

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      deleteAssignmentMutation.mutate(id)
    }
  }

  return (
    <AssignmentsErrorBoundary>
      <div className='min-h-screen bg-[#F8FAFC] dark:bg-[#020617]'>
        <Header>
          <div className='ms-auto flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <div className='mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white'>
                  Assignments
                </h1>
                <p className='mt-1 text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Manage and grade student assignments
                </p>
              </div>
              <Button
                onClick={() =>
                  createAssignmentMutation.mutate({
                    title: 'New Assignment',
                    description: 'Complete this assignment by next week',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0],
                    maxGrade: 100,
                    groupId: 1,
                  })
                }
                className='bg-[#e11d48] text-white hover:bg-[#be123c]'
              >
                <Plus className='mr-2 h-4 w-4' />
                Create Assignment
              </Button>
            </div>
          </div>

          {isLoading && <AssignmentsLoadingSkeleton />}

          {error && (
            <div className='rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
              Error loading assignments:{' '}
              {(error as Error).message || 'Unknown error occurred'}
            </div>
          )}

          {assignments && assignments.length > 0 ? (
            <>
              <AssignmentsDebugPanel />
              <AssignmentsTable
                assignments={assignments}
                onEdit={(assignment) =>
                  updateAssignmentMutation.mutate({
                    id: assignment.id,
                    payload: {
                      status:
                        assignment.status === 'pending'
                          ? 'submitted'
                          : assignment.status,
                    },
                  })
                }
                onDelete={(id) => handleDelete(id)}
              />
            </>
          ) : (
            <AssignmentsEmptyState />
          )}
        </Main>
      </div>
    </AssignmentsErrorBoundary>
  )
}
