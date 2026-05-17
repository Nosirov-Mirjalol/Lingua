import { useQuery } from '@tanstack/react-query'
import type {
  StudentAssignment,
  StudentConversation,
  StudentDashboardStats,
  StudentProfile,
  StudentScheduleItem,
} from '@/types/student'
import { apiClient } from '@/api/client'
import {
  getMyGroups,
  type StudentGroup,
} from '@/api/service/student/group.service'
import { MESSAGES, AUTH } from '@/constants/apiEndPoints'
import { useStudentUnreadCount } from './useStudentNotifications'

interface GroupMessageResponse {
  id: number
  group_name: string
  last_message?: {
    text: string
    created_at: string
  }
  unread_count: number
}

interface ProfileApiResponse {
  'User Data'?: Partial<StudentProfile>
}

interface StoredUserData extends Partial<StudentProfile> {
  first_name?: string
  last_name?: string
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (m < 1) return 'Hozirgina'
  if (m < 60) return `${m} daqiqa oldin`
  if (h < 24) return `${h} soat oldin`
  return `${d} kun oldin`
}

const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem('linguapro_user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as Partial<StudentProfile>
  } catch {
    return null
  }
}

const buildProfile = (): StudentProfile => {
  const stored = getStoredUser() as any
  const firstName = stored?.first_name || ''
  const lastName = stored?.last_name || ''
  const fullName =
    stored?.full_name ||
    `${firstName} ${lastName}`.trim() ||
    stored?.username ||
    ''

  return {
    id: stored?.id ?? 0,
    username: stored?.username || '',
    full_name: fullName,
    role: stored?.role ?? 'user',
    avatar: stored?.avatar || '/avatars/student1.jpg',
    timezone: stored?.timezone || '',
    bio: stored?.bio || '',
    learning_goal: stored?.learning_goal || '',
    activeCourse: stored?.activeCourse || '',
    nextLesson: stored?.nextLesson || '',
    completion: stored?.completion ?? 0,
    attendance: stored?.attendance ?? 0,
    streak: stored?.streak ?? 0,
  }
}

export const useStudentProfile = () => {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<ProfileApiResponse>(AUTH.PROFILE_GET)
        const userData = res['User Data'] || (res as Partial<StudentProfile>)
        sessionStorage.setItem('linguapro_user', JSON.stringify(userData))
        return buildProfile()
      } catch {
        return buildProfile()
      }
    },
    staleTime: 60_000,
  })
}

export const useStudentDashboard = () => {
  const { data: unreadRes } = useStudentUnreadCount()
  const unreadCount = unreadRes?.unread_count ?? 0
  const { data: profile } = useStudentProfile()

  return useQuery({
    queryKey: ['student', 'dashboard', unreadCount, profile],
    queryFn: async () => {
      const currentProfile = profile || buildProfile()
      const completedHours = `${Math.max(40, Math.round(currentProfile.completion * 0.8))}h`

      return {
        stats: {
          upcomingLessons: 3,
          completedHours,
          progress: currentProfile.completion,
          unreadMessages: unreadCount,
        } as StudentDashboardStats,
        highlights: [
          {
            title: 'Next lesson',
            value: currentProfile.nextLesson,
          },
          {
            title: 'Current course',
            value: currentProfile.activeCourse,
          },
          {
            title: 'Learning streak',
            value: `${currentProfile.streak} days`,
          },
        ],
        quickActions: [
          {
            label: 'Join live class',
            description: 'Today at 11:00 AM',
          },
          {
            label: 'Review vocabulary',
            description: '20 min focused practice',
          },
        ],
      }
    },
    staleTime: 60_000,
  })
}

export const useStudentSchedule = () => {
  return useQuery({
    queryKey: ['student', 'schedule'],
    queryFn: async (): Promise<StudentScheduleItem[]> => [
      {
        id: 1,
        day: 'Monday',
        time: '10:00 AM - 11:00 AM',
        title: 'Pronunciation Lab',
        location: 'Online Classroom',
        instructor: 'Ms. Ziya',
        status: 'Upcoming',
      },
      {
        id: 2,
        day: 'Wednesday',
        time: '2:00 PM - 3:00 PM',
        title: 'Grammar Workshop',
        location: 'Room 210',
        instructor: 'Mr. Eldor',
        status: 'Upcoming',
      },
      {
        id: 3,
        day: 'Friday',
        time: '4:00 PM - 5:00 PM',
        title: 'Conversation Practice',
        location: 'Study Hall',
        instructor: 'Mrs. Nilufar',
        status: 'Upcoming',
      },
    ],
    staleTime: 60_000,
  })
}

export const useStudentHomework = () => {
  return useQuery({
    queryKey: ['student', 'homework'],
    queryFn: async (): Promise<StudentAssignment[]> => [
      {
        id: 1,
        title: 'Module 4 Writing Assignment',
        course: 'Advanced English Communication',
        dueDate: 'May 4, 2026',
        status: 'Pending',
        completion: 65,
      },
      {
        id: 2,
        title: 'Pronunciation Reflection',
        course: 'Pronunciation Lab',
        dueDate: 'May 6, 2026',
        status: 'Submitted',
        completion: 100,
      },
      {
        id: 3,
        title: 'Vocabulary Drill',
        course: 'Grammar Workshop',
        dueDate: 'May 8, 2026',
        status: 'Late',
        completion: 45,
      },
    ],
    staleTime: 60_000,
  })
}

export const useStudentMessages = () => {
  return useQuery({
    queryKey: ['student', 'messages'],
    queryFn: async (): Promise<StudentConversation[]> => {
      const res = await apiClient.get<GroupMessageResponse[]>(MESSAGES.GROUPS)
      return (res || []).map((c: GroupMessageResponse) => ({
        id: c.id,
        participant: c.group_name || 'Guruh',
        subject: 'Guruh xabari',
        lastMessage: c.last_message?.text || "Xabarlar yo'q",
        time: c.last_message?.created_at
          ? formatRelativeTime(c.last_message.created_at)
          : '',
        unread: c.unread_count || 0,
        messages: [],
      }))
    },
    staleTime: 60_000,
  })
}

export const useStudentGroups = () => {
  return useQuery({
    queryKey: ['student', 'groups'],
    queryFn: (): Promise<StudentGroup[]> => getMyGroups(),
    staleTime: 60_000,
  })
}
