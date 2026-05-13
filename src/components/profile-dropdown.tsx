import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { useAuthStore } from '@/stores/auth-store'
import { useProfile } from '@/hooks/teacher/profile/useProfile'
import { useStudentProfile } from '@/hooks/student/useStudentPortal'
import { adminProfileStorageKey } from '@/components/layout/data/sidebar-data'

function getInitials(name?: string): string {
  if (!name) return 'U'
  const parts = name
    .split(' ')
    .map((p) => p.trim())
    .filter(Boolean)
  const first = parts[0]?.[0] ?? 'U'
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return `${first}${last}`.toUpperCase()
}

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const role = useAuthStore((state) => state.auth.user?.role)
  const { data: teacherProfile } = useProfile()
  const { data: studentProfile } = useStudentProfile()

  const profileData = useMemo(() => {
    if (role === 'teacher' && teacherProfile) {
      return {
        name: teacherProfile.full_name || teacherProfile.username || 'Teacher',
        email: teacherProfile.email || '',
        avatar: teacherProfile.avatar || '',
      }
    }
    if ((role === 'student' || role === 'user') && studentProfile) {
      return {
        name: studentProfile.full_name || studentProfile.username || 'Student',
        email: studentProfile.email || '',
        avatar: studentProfile.avatar || '',
      }
    }
    // Admin - get from localStorage
    if (role === 'admin') {
      try {
        const raw = localStorage.getItem(adminProfileStorageKey)
        if (raw) {
          const data = JSON.parse(raw)
          return {
            name: data.name || 'Admin',
            email: data.email || '',
            avatar: data.avatar || '',
          }
        }
      } catch {
        // continue
      }
    }
    return {
      name: 'User',
      email: '',
      avatar: '',
    }
  }, [role, teacherProfile, studentProfile])

  const profileRoute = useMemo(() => {
    switch (role) {
      case 'teacher':
        return '/teacher-dashboard/profile'
      case 'student':
      case 'user':
        return '/student/profile'
      default:
        return '/settings'
    }
  }, [role])

  const initials = useMemo(
    () => getInitials(profileData.name),
    [profileData.name]
  )

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={profileData.avatar || '/avatars/01.png'} alt={profileData.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='start' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>{profileData.name}</p>
              <p className='text-xs leading-none text-muted-foreground'>
                {profileData.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to={profileRoute}>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
            Sign out
            <DropdownMenuShortcut className='text-current'>
              ⇧⌘Q
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
