import { ClipboardCheck, DollarSign, Network, Users } from 'lucide-react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { DashboardCard } from '@/components/dashboard-card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { GroupCapacity } from './components/group-capacity'
import { StudentGrowth } from './components/student-growth'

export default function Dashboard() {
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <Header>
        <div className='ms-auto flex items-center space-x-2'>
          <ConfigDrawer />
        </div>
      </Header>

      <Main>
        {/* ── Welcome ── */}
        <div className='mb-7'>
          <p className='mb-1 text-xs font-semibold tracking-widest text-[#b80035] uppercase dark:text-rose-400'>
            Admin paneli
          </p>
          <h1 className='text-2xl font-bold text-slate-900 md:text-3xl dark:text-white'>
            Xush kelibsiz, Admin!
          </h1>
          <p className='mt-1.5 text-sm text-slate-500 dark:text-slate-400'>
            O&apos;quv markaz holati va asosiy ko&apos;rsatkichlar.
          </p>
        </div>

        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsContent value='overview' className='space-y-5 outline-none'>
            {/* ── Stats ── */}
            <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
              <DashboardCard
                title="JAMI O'QUVCHILAR"
                value='248'
                status='+12%'
                statusVariant='success'
                icon={Users}
              />
              <DashboardCard
                title='FAOL GURUHLAR'
                value='12'
                status='Barqaror'
                statusVariant='neutral'
                icon={Network}
              />
              <DashboardCard
                title='OYLIK DAROMAD'
                value='48.5M'
                status='+4.2M'
                statusVariant='success'
                icon={DollarSign}
              />
              <DashboardCard
                title="TO'LOV KUTMOQDA"
                value='23'
                status='Diqqat'
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