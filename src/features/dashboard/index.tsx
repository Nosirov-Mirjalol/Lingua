import { ClipboardCheck, DollarSign, Network, Users } from 'lucide-react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { DashboardCard } from '@/components/dashboard-card'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'
import { GroupCapacity } from './components/group-capacity'
import { StudentGrowth } from './components/student-growth'
import { useAdminDashboardStats } from '@/hooks/admin/useAdminDashboardStats'

export default function Dashboard() {
  const stats = useAdminDashboardStats()

  return (
    <div className='min-h-screen bg-background'>
      <AdminHeader fixed>
        <ConfigDrawer />
      </AdminHeader>

      <Main className='bg-background'>
        {/* ── Welcome ── */}
        <div className='mb-7'>
          <p className='mb-1 text-xs font-semibold tracking-widest text-primary uppercase'>
            Admin paneli
          </p>
          <h1 className='text-2xl font-bold text-foreground md:text-3xl'>
            Xush kelibsiz, Admin!
          </h1>
          <p className='mt-1.5 text-sm text-muted-foreground'>
            O&apos;quv markaz holati va asosiy ko&apos;rsatkichlar.
          </p>
        </div>

        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsContent value='overview' className='space-y-5 outline-none'>
            {/* ── Stats ── */}
            <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
              <DashboardCard
                title="JAMI O'QUVCHILAR"
                value={String(stats.totalStudents || 0)}
                status={`${stats.activeStudents || 0} ta faol`}
                statusVariant='success'
                icon={Users}
              />
              <DashboardCard
                title='JAMI USTOZLAR'
                value={String(stats.totalTeachers || 0)}
                status='O`qituvchilar'
                statusVariant='neutral'
                icon={Network}
              />
              <DashboardCard
                title='JAMI GURUHLAR'
                value={String(stats.totalGroups || 0)}
                status={`${stats.activeGroups || 0} ta faol`}
                statusVariant='success'
                icon={DollarSign}
              />
              <DashboardCard
                title="JAMI KURSLAR"
                value={String(stats.totalCourses || 0)}
                status='Mavjud'
                statusVariant='warning'
                icon={ClipboardCheck}
              />
            </div>

            {/* ── Charts ── */}
            <div className='grid grid-cols-1 gap-5 lg:grid-cols-7'>
              <StudentGrowth />
              <GroupCapacity />
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </div>
  )
}
