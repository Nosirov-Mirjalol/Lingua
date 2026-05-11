import {
  Users,
  Network,
  DollarSign,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { RoseButton } from '@/components/ui/rose-button'
import { DashboardCard } from '@/components/dashboard-card'

export default function Dashboard() {
  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='mx-auto max-w-7xl px-6 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-extrabold text-slate-900'>Dashboard</h1>
          <p className='mt-1 text-slate-500'>
            Welcome to your dashboard overview
          </p>
        </div>

        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
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

        <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <div className='rounded-2xl bg-white p-6 shadow-sm lg:col-span-2'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-bold text-slate-900'>
                Recent Activity
              </h2>
              <RoseButton roseVariant='link' roseSize='sm'>
                View All
              </RoseButton>
            </div>
            <div className='space-y-3'>
              <div className='flex items-center gap-4 rounded-xl bg-slate-50 p-4'>
                <div className='rounded-full bg-emerald-100 p-2 text-emerald-600'>
                  <Users size={18} />
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-semibold text-slate-900'>
                    New student registered
                  </p>
                  <p className='text-xs text-slate-500'>2 minutes ago</p>
                </div>
                <TrendingUp size={16} className='text-emerald-600' />
              </div>
              <div className='flex items-center gap-4 rounded-xl bg-slate-50 p-4'>
                <div className='rounded-full bg-rose-100 p-2 text-rose-600'>
                  <DollarSign size={18} />
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-semibold text-slate-900'>
                    Payment received
                  </p>
                  <p className='text-xs text-slate-500'>15 minutes ago</p>
                </div>
                <TrendingUp size={16} className='text-emerald-600' />
              </div>
              <div className='flex items-center gap-4 rounded-xl bg-slate-50 p-4'>
                <div className='rounded-full bg-amber-100 p-2 text-amber-600'>
                  <ClipboardCheck size={18} />
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-semibold text-slate-900'>
                    Pending payment reminder
                  </p>
                  <p className='text-xs text-slate-500'>1 hour ago</p>
                </div>
                <TrendingDown size={16} className='text-amber-600' />
              </div>
            </div>
          </div>

          <div className='rounded-2xl bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-lg font-bold text-slate-900'>
              Quick Stats
            </h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between rounded-xl bg-slate-50 p-4'>
                <span className='text-sm font-medium text-slate-600'>
                  Total Teachers
                </span>
                <span className='text-sm font-bold text-slate-900'>8</span>
              </div>
              <div className='flex items-center justify-between rounded-xl bg-slate-50 p-4'>
                <span className='text-sm font-medium text-slate-600'>
                  Active Groups
                </span>
                <span className='text-sm font-bold text-slate-900'>12</span>
              </div>
              <div className='flex items-center justify-between rounded-xl bg-slate-50 p-4'>
                <span className='text-sm font-medium text-slate-600'>
                  Pending Tasks
                </span>
                <span className='text-sm font-bold text-slate-900'>5</span>
              </div>
              <div className='flex items-center justify-between rounded-xl bg-slate-50 p-4'>
                <span className='text-sm font-medium text-slate-600'>
                  Completion Rate
                </span>
                <span className='text-sm font-bold text-emerald-600'>87%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
