import { ClipboardCheck, DollarSign, Network, Users } from 'lucide-react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { DashboardCard } from '@/components/dashboard-card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { GroupCapacity } from './components/group-capacity'
import { StudentGrowth } from './components/student-growth'

export default function Dashboard() {
  return (
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
          <h1 className='text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white'>
            Welcome, Admin!
          </h1>
          <p className='mt-1 text-sm font-medium text-[#E11D48]'>
            Current status and key indicators of the training center.
          </p>
        </div>

        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsContent value='overview' className='space-y-6 outline-none'>
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
              <DashboardCard
                title='TOTAL STUDENTS'
                value='248'
                status='+12%'
                statusVariant='success'
                icon={Users}
              />

              <DashboardCard
                title='ACTIVE GROUPS'
                value='12'
                status='Stable'
                statusVariant='neutral'
                icon={Network}
              />

              <DashboardCard
                title='MONTHLY REVENUE'
                value='48.5M UZS'
                status='+4.2M'
                statusVariant='success'
                icon={DollarSign}
              />

              <DashboardCard
                title='PENDING PAYMENTS'
                value='23'
                status='Attention'
                statusVariant='warning'
                icon={ClipboardCheck}
              />
            </div>

            {/* Pastki grafik va ro'yxat */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-7'>
              <StudentGrowth />
              <GroupCapacity />
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </div>
  )
}
