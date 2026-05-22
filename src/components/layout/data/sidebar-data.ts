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
  User,
  Users,
} from 'lucide-react'
import { CustomLogo } from '@/assets/custom-logo'
import { type SidebarData } from '../types'

export const adminProfileStorageKey = 'linguapro_admin_profile'
export type SidebarRole = 'admin' | 'teacher' | 'student'

export const studentSidebarData: SidebarData = {
  user: {
    name: 'Talaba',
    email: '',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'LinguaPro Talaba',
      logo: CustomLogo,
      plan: 'TALABA PORTALI',
    },
  ],
  navGroups: [
    {
      title: 'Ish maydoni',
      items: [
        { title: 'Bosh sahifa', url: '/student', icon: LayoutDashboard },
        { title: 'Dars jadvali', url: '/student/schedule', icon: CalendarDays },
        {
          title: 'Uy vazifalari',
          url: '/student/homework',
          icon: ClipboardList,
        },
        { title: 'Xabarlar', url: '/student/messages', icon: MessageSquare },
        { title: 'Chatlar', url: '/student-chats', icon: MessageSquare },
        { title: 'Mening guruhim', url: '/student/groups', icon: BookOpen },
        { title: 'Profil', url: '/student/profile', icon: User },
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
          title: 'Notifications',
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
      {
        title: 'Account',
        items: [
          {
            title: 'Profile',
            url: '/teacher-dashboard/profile',
            icon: User,
          },
        ],
      },
    ],
  },
  student: studentSidebarData,
}
