import { useMemo } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { normalizeUserRole } from '@/lib/auth-role'
import { useLayout } from '@/context/layout-provider'
import { useStudentProfile } from '@/hooks/student/useStudentPortal'
import { useProfile } from '@/hooks/teacher/profile/useProfile'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  adminProfileStorageKey,
  roleSidebarData,
  type SidebarRole,
} from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

function getStoredRole(): SidebarRole {
  try {
    const raw = sessionStorage.getItem('linguapro_user')
    if (!raw) return 'admin'
    const parsed = JSON.parse(raw) as { role?: unknown }
    const role = normalizeUserRole(parsed.role)
    if (role === 'teacher') return 'teacher'
    return 'admin'
  } catch {
    return 'admin'
  }
}

export function AppSidebar() {
  const roleFromStore = useAuthStore((state) => state.auth.user?.role)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isTeacherRoute = pathname.startsWith('/teacher-dashboard')
  const role =
    roleFromStore === 'teacher' || isTeacherRoute ? 'teacher' : getStoredRole()
  const { collapsible, variant } = useLayout()
  const sidebarData = roleSidebarData[role]

  // Get dynamic profile data
  const { data: teacherProfile } = useProfile()
  const { data: studentProfile } = useStudentProfile()

  // Build user object dynamically based on role and profile data
  const user = useMemo(() => {
    if (role === 'teacher' && teacherProfile) {
      return {
        name: teacherProfile.full_name || teacherProfile.username || 'Teacher',
        email: teacherProfile.email || '',
        avatar: teacherProfile.avatar || '',
      }
    }
    if (role === 'student' && studentProfile) {
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

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
