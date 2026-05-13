import {
  AudioWaveform,
  Book,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  GalleryVerticalEnd,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  Settings,
  User,
  Users,
} from 'lucide-react'
import { CustomLogo } from '@/assets/custom-logo'
import { type SidebarData } from '../types'

export const adminProfileStorageKey = 'linguapro_admin_profile'
export type SidebarRole = 'admin' | 'teacher' | 'student'

export const studentSidebarData: SidebarData = {
  user: {
    name: 'Student',
    email: '',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'LinguaPro Student',
      logo: CustomLogo,
      plan: 'STUDENT PORTAL',
    },
  ],
  navGroups: [
    {
      title: 'Workspace',
      items: [
        { title: 'Overview', url: '/student', icon: LayoutDashboard },
        { title: 'Schedule', url: '/student/schedule', icon: CalendarDays },
        { title: 'Homework', url: '/student/homework', icon: ClipboardList },
        { title: 'Messages', url: '/student/messages', icon: MessageSquare },
        { title: 'Chats', url: '/student-chats', icon: MessageSquare },
        { title: 'Courses', url: '/student/courses', icon: BookOpen },
        { title: 'Profile', url: '/student/profile', icon: User },
      ],
    },
  ],
}

export const adminSidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'LinguaPro Admin',
      logo: CustomLogo,
      plan: 'MANAGEMENT CONSOLE',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/admin-dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Students',
          url: '/admin-students',
          icon: User,
        },
        {
          title: 'Teachers',
          url: '/teachers',
          icon: GraduationCap,
        },
        {
          title: 'Groups',
          url: '/groups',
          icon: Users,
        },
        {
          title: 'Courses',
          url: '/admin-courses',
          icon: Book,
        },
        {
          title: 'Reports',
          url: '/notifications',
          icon: ScrollText,
        },
        {
          title: 'Chats',
          url: '/admin-chats',
          icon: MessageSquare,
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Settings',
          url: '/settings',
          icon: Settings,
        },
      ],
    },
  ],
}

export const sidebarData = adminSidebarData

export const teacherSidebarData = {
  user: {
    name: 'Teacher',
    email: '',
    avatar: '/avatars/shadcn.jpg',
  },
  navItems: [
    {
      title: 'Dashboard',
      url: '/teacher-dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Groups',
      url: '/teacher-dashboard/groups',
      icon: BookOpen,
    },
    {
      title: 'Attendance',
      url: '/teacher-dashboard/attendance',
      icon: ClipboardCheck,
    },
    {
      title: 'Homework',
      url: '/teacher-dashboard/homework',
      icon: GraduationCap,
    },
    {
      title: 'Messages',
      url: '/teacher-dashboard/messages',
      icon: MessageSquare,
    },
  ],
  ctaLabel: 'New Class Session',
} as const

export const roleSidebarData: Record<SidebarRole, SidebarData> = {
  admin: adminSidebarData,
  teacher: {
    user: teacherSidebarData.user,
    teams: [
      {
        name: 'LinguaPro Teacher',
        logo: CustomLogo,
        plan: 'TEACHER PORTAL',
      },
    ],
    navGroups: [
      {
        title: 'General',
        items: teacherSidebarData.navItems.map((item) => ({
          title: item.title,
          url: item.url,
          icon: item.icon,
        })),
      },
    ],
  },
  student: studentSidebarData,
}
