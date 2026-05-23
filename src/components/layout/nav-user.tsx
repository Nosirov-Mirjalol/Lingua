import { ChevronsUpDown, LogOut } from 'lucide-react'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { getFullAvatarUrl } from '@/lib/avatar-url'

type NavUserProps = {
  user: {
    name: string
    email?: string
    avatar: string
  }
  role?: string
}

export function NavUser({ user, role }: NavUserProps) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()

  const avatarUrl = getFullAvatarUrl(user.avatar)

  // Fallback initials — "Ali Valiyev" → "AV"
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'SN'

  // Sidebar va dropdown uchun umumiy user info blok
  const UserInfo = () => (
    <div className='grid flex-1 text-start text-sm leading-tight'>
      <span className='truncate font-semibold'>{user.name}</span>
      {/* role yoki email — bittasini ko'rsat */}
      {role ? (
        <span className='truncate text-xs text-muted-foreground capitalize'>
          {role}
        </span>
      ) : user.email ? (
        <span className='truncate text-xs text-muted-foreground'>
          {user.email}
        </span>
      ) : null}
    </div>
  )

  const UserAvatar = () => (
    <Avatar className='h-8 w-8 rounded-lg'>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
      <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
    </Avatar>
  )

  return (
    <>
      <SidebarMenu className='-mt-5'>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <UserAvatar />
                <UserInfo />
                <ChevronsUpDown className='ms-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                  <UserAvatar />
                  <UserInfo />
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant='destructive'
                onClick={() => setOpen(true)}
              >
                <LogOut />
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}