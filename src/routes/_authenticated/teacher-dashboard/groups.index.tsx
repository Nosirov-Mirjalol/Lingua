import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, Loader2, Search, Users, ChevronRight, GraduationCap } from 'lucide-react'
import { useTeacherGroups } from '@/hooks/teacher/groups/useTeacherGroups'
import { useProfile } from '@/hooks/teacher/profile/useProfile'
import { Input } from '@/components/ui/input'
import { RoseButton } from '@/components/ui/rose-button'

export const Route = createFileRoute('/_authenticated/teacher-dashboard/groups/')({
  component: GroupsIndexPage,
})

function GroupsIndexPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: profile } = useProfile()
  const { data: groups = [], isLoading, isError } = useTeacherGroups()

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let result = groups
    if (profile?.id) result = result.filter((g) => g.teacher === profile.id)
    if (q) result = result.filter((g) => g.name.toLowerCase().includes(q))
    return result
  }, [groups, searchQuery, profile?.id])

  return (
    <div className='min-h-full w-full bg-slate-50/50 dark:bg-transparent px-4 py-6 sm:px-6 md:px-8 lg:py-10'>
      <div className='mx-auto max-w-5xl space-y-6 sm:space-y-8'>
        
        {/* Header Section */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-rose-100 to-rose-50 dark:from-rose-900/40 dark:to-rose-950/40 shadow-inner'>
              <BookOpen className='h-6 w-6 text-rose-600 dark:text-rose-400' />
            </div>
            <div>
              <h1 className='bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-2xl font-black text-transparent sm:text-3xl'>
                Mening Guruhlarim
              </h1>
              <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
                Sizga biriktirilgan barcha guruhlar ro'yxati
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className='group relative w-full sm:w-72 md:w-80'>
            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-rose-500' size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Guruh nomini qidiring...'
              className='h-11 rounded-xl border-slate-200 bg-white pl-10 pr-4 text-sm shadow-sm transition-all focus:border-rose-500 focus:ring-rose-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:focus:border-rose-500'
            />
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className='flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20'>
            <Loader2 className='h-8 w-8 animate-spin text-rose-500' />
          </div>
        ) : isError ? (
          <div className='rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400'>
            Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/50'>
            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/50'>
              <GraduationCap className='h-8 w-8 text-slate-400 dark:text-slate-500' />
            </div>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Guruhlar topilmadi</h3>
            <p className='mt-1 max-w-sm text-center text-sm text-slate-500 dark:text-slate-400'>
              Qidiruv so'rovingizga mos yoki sizga biriktirilgan guruh hozircha yo'q.
            </p>
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
            {filteredGroups.map((g) => (
              <div
                key={g.id}
                className='group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-900/50 dark:hover:shadow-rose-900/10'
              >
                <div className='mb-4 flex items-start justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 group-hover:scale-110 group-hover:bg-rose-100 transition-all dark:bg-rose-950/40 dark:text-rose-400 dark:group-hover:bg-rose-900/50'>
                      <Users size={18} />
                    </div>
                    <div>
                      <h3 className='line-clamp-1 font-semibold text-slate-900 dark:text-slate-100 sm:text-lg'>
                        {g.name}
                      </h3>
                      <div className='mt-1 flex items-center gap-2 text-xs font-medium'>
                        <span
                          className={`flex items-center rounded-full px-2 py-0.5 ${
                            g.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${g.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span className='capitalize'>{g.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mb-5 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400'>
                  <div className='flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 dark:bg-slate-800/50'>
                    <GraduationCap size={16} className='text-slate-400' />
                    <span><strong className='text-slate-900 dark:text-white'>{g.students.length}</strong> o'quvchi</span>
                  </div>
                </div>

                <RoseButton
                  roseVariant='ghost'
                  className='w-full rounded-xl font-semibold shadow-sm transition-all'
                  asChild
                >
                  <Link to='/teacher-dashboard/groups/$groupId' params={{ groupId: String(g.id) }}>
                    Guruhni boshqarish
                    <ChevronRight size={16} className='ml-1.5 transition-transform group-hover:translate-x-0.5' />
                  </Link>
                </RoseButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}