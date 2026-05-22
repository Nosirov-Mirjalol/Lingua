import { useMemo } from 'react'
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  User,
} from 'lucide-react'
import { CustomLogo } from '@/assets/custom-logo'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useLayout } from '@/context/layout-provider'
import { useStudentProfile } from '@/hooks/student/useStudentPortal'

const studentSidebarData = {
  navGroups: [
    {
      title: 'Workspace',
      items: [
        { title: 'Overview', url: '/student', icon: LayoutDashboard },
        { title: 'Schedule', url: '/student/schedule', icon: CalendarDays },
        { title: 'Homework', url: '/student/homework', icon: ClipboardList },
        { title: 'Messages', url: '/student/messages', icon: MessageSquare },
        { title: 'My Groups', url: '/student/groups', icon: BookOpen },
        { title: 'Profile', url: '/student/profile', icon: User },
      ],
    },
  ],
}

export function StudentSidebar() {
  const { collapsible, variant } = useLayout()
  const { data: profile } = useStudentProfile()

  const user = useMemo(
    () => ({
      name: profile?.full_name || 'Student',
      avatar: '/avatars/student1.jpg',
    }),
    [profile]
  )

  const teams = useMemo(
    () => [
      {
        name: 'LinguaPro Student',
        logo: CustomLogo,
        plan: 'LEARNING PORTAL',
      },
    ],
    []
  )

  const groups = useMemo(() => studentSidebarData.navGroups, [])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} role='student' />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
