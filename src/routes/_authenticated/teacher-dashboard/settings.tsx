import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Main } from '@/components/layout/main'
import { AppearanceSettings } from '@/features/teacher-settings/appearance/appearance-settings'

export const Route = createFileRoute(
  '/_authenticated/teacher-dashboard/settings'
)({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <>
      <Main>
        <div className='mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
          {/* Header */}
          <div className='mb-6 flex items-center gap-3 lg:mb-8'>
            <Link to='/teacher-dashboard'>
              <button className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 sm:h-10 sm:w-10'>
                <ArrowLeft size={18} className='sm:h-5 sm:w-5' />
              </button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 md:text-3xl'>
                Settings
              </h1>
              <p className='text-xs text-gray-500 sm:text-sm'>
                Manage your interface preferences
              </p>
            </div>
          </div>

          {/* Settings Content */}
          <AppearanceSettings />
        </div>
      </Main>
    </>
  )
}
