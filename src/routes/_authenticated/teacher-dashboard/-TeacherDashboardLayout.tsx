import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { DashboardNavbar } from '@/components/layout/dashboard-navbar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export function TeacherDashboardLayout() {
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset
            className={cn(
              '@container/content bg-slate-50 dark:bg-[#020617]',
              'has-data-[layout=fixed]:h-svh',
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            <DashboardNavbar />
            <main className='min-w-0 flex-1 px-3 py-2 md:px-8 md:py-3 lg:px-12 lg:py-8'>
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
