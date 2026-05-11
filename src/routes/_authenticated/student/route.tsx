import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { StudentSidebar } from '@/components/student/layout/StudentSidebar'
import { StudentNavbar } from '@/components/student/layout/StudentNavbar'
import { StudentGuard } from '@/components/student/layout/StudentGuard'

export const Route = createFileRoute('/_authenticated/student')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return

    const raw = sessionStorage.getItem('linguapro_user')
    if (!raw) throw redirect({ to: '/sign-in' })

    try {
      const user = JSON.parse(raw) as { role?: string }
      if (!user.role) throw redirect({ to: '/sign-in' })
      if (user.role !== 'user' && user.role !== 'student') {
        if (user.role === 'teacher') {
          throw redirect({ to: '/teacher-dashboard' })
        }
        if (user.role === 'admin') {
          throw redirect({ to: '/admin-dashboard' })
        }
        throw redirect({ to: '/sign-in' })
      }
    } catch {
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
          <StudentSidebar />
          <SidebarInset
            className={cn(
              '@container/content bg-slate-50',
              'has-data-[layout=fixed]:h-svh',
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            <StudentNavbar />
            <StudentGuard>
              <main className='min-w-0 flex-1 px-4 py-4 md:px-8 md:py-6 md:pb-6'>
                <Outlet />
              </main>
            </StudentGuard>
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
