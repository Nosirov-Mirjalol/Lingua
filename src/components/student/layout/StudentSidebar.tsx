import { useEffect, useMemo } from 'react'
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

const AVATAR_STORAGE_KEY = 'student_avatar'

const studentSidebarData = {
  navGroups: [
    {
      title: 'Workspace',
      items: [
        { title: 'Dashboard', url: '/student', icon: LayoutDashboard },
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

  // API dan yangi avatar kelsa — localStorage ga saqla
  useEffect(() => {
    if (profile?.avatar) {
      localStorage.setItem(AVATAR_STORAGE_KEY, profile.avatar)
    }
  }, [profile?.avatar])

  const user = useMemo(() => {
    // localStorage dan o'qi, yo'q bo'lsa API dan ol
    const savedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY)
    const avatar = savedAvatar || profile?.avatar || '/avatars/student1.jpg'

    return {
      name: profile?.full_name || 'Student',
      email: profile?.username || 'student@linguapro.com',
      avatar,
    }
  }, [profile])

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