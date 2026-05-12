import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { TeacherNavbar } from '@/components/teacher/TeacherNavbar'

export const Route = createFileRoute('/_authenticated/teacher-dashboard')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return
    const raw = sessionStorage.getItem('linguapro_user')
    if (!raw) {
      throw redirect({ to: '/sign-in' })
    }
    try {
      const user = JSON.parse(raw) as { role?: string }
      if (!user.role) {
        throw redirect({ to: '/sign-in' })
      }
      if (user.role === 'admin') {
        throw redirect({ to: '/admin-dashboard' })
      }
      if (user.role !== 'teacher') {
        throw redirect({ to: '/student' })
      }
    } catch {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: TeacherDashboardLayout,
})

function TeacherDashboardLayout() {
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset
            className={cn(
              '@container/content bg-slate-50',
              'has-data-[layout=fixed]:h-svh',
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            <TeacherNavbar />
            <main className='min-w-0 flex-1 overflow-hidden px-4 py-0 md:px-2 md:py-2'>
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
