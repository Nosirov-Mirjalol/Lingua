import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, Loader2, Search, Users } from 'lucide-react'
import { useTeacherGroups } from '@/hooks/teacher/groups/useTeacherGroups'
import { useProfile } from '@/hooks/teacher/profile/useProfile'
import { Input } from '@/components/ui/input'
import { RoseButton } from '@/components/ui/rose-button'

export const Route = createFileRoute(
  '/_authenticated/teacher-dashboard/groups/'
)({
  component: GroupsIndexPage,
})

function GroupsIndexPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: profile } = useProfile()
  const {
    data: groups = [],
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
  } = useTeacherGroups()

  const filteredGroups = useMemo(() => {
    const teacherId = profile?.id
    const q = searchQuery.trim().toLowerCase()
    let result = groups
    if (teacherId) {
      result = result.filter((g) => g.teacher === teacherId)
    }
    if (q) {
      result = result.filter((g) => g.name.toLowerCase().includes(q))
    }
    return result
  }, [groups, searchQuery, profile?.id])

  return (
    <div className='mx-auto max-w-5xl px-3 py-5 sm:px-5 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10'>
      <div className='mb-6 sm:mb-7 md:mb-8'>
        <div className='flex items-center gap-2 sm:gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 sm:h-10 sm:w-10'>
            <BookOpen size={18} className='text-rose-600 sm:h-5 sm:w-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl'>
              Groups
            </h1>
            <p className='text-xs text-slate-500 sm:text-sm'>
              Sizga biriktirilgan guruhlar
            </p>
          </div>
        </div>
      </div>

      <div className='relative mb-4 w-full sm:mb-5 sm:max-w-sm md:mb-6 md:max-w-md'>
        <Search
          className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400'
          size={15}
        />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search groups by name...'
          className='h-9 rounded-xl border-slate-200 bg-white pl-9 text-xs shadow-sm sm:h-10 sm:text-sm'
        />
      </div>

      {isLoadingGroups ? (
        <div className='flex h-36 items-center justify-center text-slate-400 sm:h-48'>
          <Loader2 className='animate-spin' size={22} />
        </div>
      ) : isErrorGroups ? (
        <div className='rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs text-rose-700 sm:px-4 sm:py-3 sm:text-sm'>
          Failed to load groups. Please try again.
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center sm:py-16'>
          <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 sm:h-12 sm:w-12'>
            <Users size={20} className='sm:h-6 sm:w-6' />
          </div>
          <p className='text-sm font-semibold text-slate-700'>No groups found</p>
          <p className='mt-1 text-xs text-slate-400'>
            Sizga tegishli guruh topilmadi
          </p>
        </div>
      ) : (
        <div className='space-y-2 sm:space-y-3'>
          {filteredGroups.map((g) => (
            <div
              key={g.id}
              className={[
                'flex items-center justify-between',
                'gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-3.5 md:px-5 md:py-4',
                'rounded-2xl border border-slate-100 bg-white shadow-sm',
                'transition-shadow hover:shadow-md',
              ].join(' ')}
            >
              <div className='flex min-w-0 items-center gap-3 sm:gap-4'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 sm:h-10 sm:w-10 md:h-11 md:w-11'>
                  <Users size={17} className='text-rose-500 sm:h-5 sm:w-5' />
                </div>

                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold text-slate-900 sm:text-base'>
                    {g.name}
                  </p>

                  <div className='mt-0.5 flex flex-wrap items-center gap-1.5 sm:mt-1 sm:gap-2'>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                        g.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {g.status}
                    </span>

                    <span className='text-slate-300'>·</span>

                    <span className='flex items-center gap-1 text-xs text-slate-500'>
                      <Users size={11} />
                      {g.students.length} students
                    </span>
                  </div>
                </div>
              </div>

              <RoseButton
                roseVariant='outline'
                className='ml-2 h-8 shrink-0 rounded-xl px-3 text-xs font-semibold sm:ml-4 sm:h-9 sm:px-4 sm:text-sm'
                asChild
              >
                <Link
                  to='/teacher-dashboard/groups/$groupId'
                  params={{ groupId: String(g.id) }}
                >
                  <span className='sm:hidden'>Manage</span>
                  <span className='hidden sm:inline'>Manage Students</span>
                </Link>
              </RoseButton>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
