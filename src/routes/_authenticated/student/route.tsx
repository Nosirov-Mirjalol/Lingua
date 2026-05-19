import { Suspense, lazy } from 'react'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSessionUserRole } from '@/lib/auth-role'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { DashboardNavbar } from '@/components/layout/dashboard-navbar'
import { StudentGuard } from '@/components/student/layout/StudentGuard'
import { StudentRouteFallback } from '@/components/student/layout/StudentRouteFallback'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

const StudentSidebar = lazy(() =>
  import('@/components/student/layout/StudentSidebar').then((module) => ({
    default: module.StudentSidebar,
  }))
)

export const Route = createFileRoute('/_authenticated/student')({
  beforeLoad: () => {
    const role = getSessionUserRole()
    if (!role) throw redirect({ to: '/sign-in' })
    if (role !== 'user' && role !== 'student') {
      if (role === 'teacher') {
        throw redirect({ to: '/teacher-dashboard' })
      }
      if (role === 'admin') {
        throw redirect({ to: '/admin-dashboard' })
      }
      throw redirect({ to: '/sign-in' })
    }
  },
  component: StudentLayout,
})

function StudentLayout() {
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen} className='student-portal'>
          <Suspense fallback={null}>
            <StudentSidebar />
          </Suspense>
          <SidebarInset
            className={cn(
              '@container/content bg-background',
              'has-data-[layout=fixed]:h-svh',
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            <DashboardNavbar />
            <StudentGuard>
              <main className='mx-auto w-full max-w-7xl min-w-0 flex-1 px-4 py-4 md:px-8 md:py-6 md:pb-6'>
                <Suspense fallback={<StudentRouteFallback />}>
                  <Outlet />
                </Suspense>
              </main>
            </StudentGuard>
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
