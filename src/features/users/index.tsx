import { useAdminUsers } from '@/hooks/admin/users/useAdminUsers'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'

export function Users() {
  const { data, isLoading, isError } = useAdminUsers()

  const tableData = (data?.results ?? []).map((u) => ({
    id: String(u.id),
    firstName: u.first_name ?? '',
    lastName: u.last_name ?? '',
    username: u.username ?? '',
    email: u.email ?? '',
    phoneNumber: u.phone ?? '',
    status: u.is_active ? ('active' as const) : ('inactive' as const),
    role: u.role,
    createdAt: new Date(u.created_at),
    updatedAt: new Date(u.updated_at),
  }))

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className='text-sm text-muted-foreground'>Loading...</div>
        ) : isError ? (
          <div className='text-sm text-destructive'>Failed to load users.</div>
        ) : (
          <UsersTable data={tableData} />
        )}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
