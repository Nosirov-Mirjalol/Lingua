import { BookOpen, Network, Users, Users2 } from 'lucide-react'
import { useAdminDashboardStats } from '@/hooks/admin/useAdminDashboardStats'
import { DashboardCard } from '@/components/dashboard-card'

export default function Dashboard() {
  const stats = useAdminDashboardStats()

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='mx-auto max-w-7xl px-6 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-extrabold text-slate-900'>Dashboard</h1>
          <p className='mt-1 text-slate-500'>Admin paneli statistikasi</p>
        </div>

        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
          <DashboardCard
            title='JAMI STUDENTLAR'
            value={String(stats.totalStudents)}
            status={`${stats.activeStudents} faol`}
            statusVariant='success'
            icon={Users}
          />

          <DashboardCard
            title='JAMI GURUHLAR'
            value={String(stats.totalGroups)}
            status={`${stats.activeGroups} faol`}
            statusVariant='neutral'
            icon={Network}
          />

          <DashboardCard
            title='JAMI USTOZLAR'
            value={String(stats.totalTeachers)}
            status='Barchasi faol'
            statusVariant='success'
            icon={Users2}
          />

          <DashboardCard
            title='JAMI KURSLAR'
            value={String(stats.totalCourses)}
            status={`${stats.completionRate}% tugatilgan`}
            statusVariant='success'
            icon={BookOpen}
          />
        </div>

        <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <div className='rounded-2xl bg-white p-6 shadow-sm lg:col-span-2'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-bold text-slate-900'>
                Tezkor statistika
              </h2>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center justify-between rounded-xl bg-slate-50 p-4'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-full bg-emerald-100 p-2 text-emerald-600'>
                    <Users size={18} />
                  </div>
                  <span className='text-sm font-medium text-slate-600'>
                    Faol studentlar
                  </span>
                </div>
                <span className='text-sm font-bold text-slate-900'>
                  {stats.activeStudents} / {stats.totalStudents}
                </span>
              </div>
              <div className='flex items-center justify-between rounded-xl bg-slate-50 p-4'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-full bg-blue-100 p-2 text-blue-600'>
                    <Network size={18} />
                  </div>
                  <span className='text-sm font-medium text-slate-600'>
                    Faol guruhlar
                  </span>
                </div>
                <span className='text-sm font-bold text-slate-900'>
                  {stats.activeGroups} / {stats.totalGroups}
                </span>
              </div>
              <div className='flex items-center justify-between rounded-xl bg-slate-50 p-4'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-full bg-purple-100 p-2 text-purple-600'>
                    <Users2 size={18} />
                  </div>
                  <span className='text-sm font-medium text-slate-600'>
                    Barcha ustozlar
                  </span>
                </div>
                <span className='text-sm font-bold text-slate-900'>
                  {stats.totalTeachers}
                </span>
              </div>
              <div className='flex items-center justify-between rounded-xl bg-slate-50 p-4'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-full bg-amber-100 p-2 text-amber-600'>
                    <BookOpen size={18} />
                  </div>
                  <span className='text-sm font-medium text-slate-600'>
                    Tugatilgan kurslar
                  </span>
                </div>
                <span className='text-sm font-bold text-slate-900'>
                  {stats.completionRate}%
                </span>
              </div>
            </div>
          </div>

          <div className='rounded-2xl bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-lg font-bold text-slate-900'>
              Tizim holati
            </h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between rounded-xl bg-slate-50 p-4'>
                <span className='text-sm font-medium text-slate-600'>
                  Studentlar
                </span>
                <span className='text-sm font-bold text-slate-900'>
                  {stats.totalStudents}
                </span>
              </div>
              <div className='flex items-center justify-between rounded-xl bg-slate-50 p-4'>
                <span className='text-sm font-medium text-slate-600'>
                  Guruhlar
                </span>
                <span className='text-sm font-bold text-slate-900'>
                  {stats.totalGroups}
                </span>
              </div>
              <div className='flex items-center justify-between rounded-xl bg-slate-50 p-4'>
                <span className='text-sm font-medium text-slate-600'>
                  Ustozlar
                </span>
                <span className='text-sm font-bold text-slate-900'>
                  {stats.totalTeachers}
                </span>
              </div>
              <div className='flex items-center justify-between rounded-xl bg-slate-50 p-4'>
                <span className='text-sm font-medium text-slate-600'>
                  Kurslar
                </span>
                <span className='text-sm font-bold text-slate-900'>
                  {stats.totalCourses}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
