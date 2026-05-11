import { useLayout } from '@/context/layout-provider'
import { useRouterState } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
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
    return parsed.role === 'teacher' ? 'teacher' : 'admin'
  } catch {
    return 'admin'
  }
}

function getSidebarUser(role: SidebarRole) {
  if (role === 'teacher') {
    try {
      const raw = sessionStorage.getItem('linguapro_user')
      if (!raw) return roleSidebarData.teacher.user

      const parsed = JSON.parse(raw) as { email?: unknown }
      return {
        name: 'Teacher',
        email: typeof parsed.email === 'string' ? parsed.email : '',
        avatar: roleSidebarData.teacher.user.avatar,
      }
    } catch {
      return roleSidebarData.teacher.user
    }
  }

  try {
    const raw = localStorage.getItem(adminProfileStorageKey)
    if (!raw) return roleSidebarData.admin.user
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'name' in parsed &&
      'email' in parsed &&
      'avatar' in parsed
    ) {
      const user = parsed as { name: unknown; email: unknown; avatar: unknown }
      if (
        typeof user.name === 'string' &&
        typeof user.email === 'string' &&
        typeof user.avatar === 'string'
      ) {
        return { name: user.name, email: user.email, avatar: user.avatar }
      }
    }
  } catch {
    return roleSidebarData.admin.user
  }

  return roleSidebarData.admin.user
}

export function AppSidebar() {
  const roleFromStore = useAuthStore((state) => state.auth.user?.role)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isTeacherRoute = pathname.startsWith('/teacher-dashboard')
  const role =
    roleFromStore === 'teacher' || isTeacherRoute
      ? 'teacher'
      : getStoredRole()
  const { collapsible, variant } = useLayout()
  const sidebarData = roleSidebarData[role]
  const user = getSidebarUser(role)

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
