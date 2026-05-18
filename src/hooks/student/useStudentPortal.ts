import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyGroups } from '@/api/service/student/group.service'
import { useStudentUnreadCount } from './useStudentNotifications'
import { apiClient } from '@/api/client'
import { GROUP, MESSAGES } from '@/constants/apiEndPoints'
import type {
  StudentAssignment,
  StudentConversation,
  StudentDashboardStats,
  StudentProfile,
  StudentScheduleItem,
} from '@/types/student'
import type { StudentGroup } from '@/api/service/student/group.service'
import { getMyAssignments, submitAssignment } from '@/services/assignment.service'
import type { Assignment, SubmitAssignmentPayload } from '@/types/assignment.types'
import { formatLessonDays } from '@/lib/formatters'

type StudentScheduleApiItem = Partial<StudentScheduleItem> &
  Partial<StudentGroup> & {
    course_name?: string
    lesson_status?: string
    start_time?: string
    end_time?: string
    group_name?: string
    days?: string[]
  }

function asScheduleArray(value: unknown): StudentScheduleApiItem[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is StudentScheduleApiItem =>
      !!item && typeof item === 'object'
  )
}

function unwrapSchedule(raw: unknown): StudentScheduleApiItem[] {
  const direct = asScheduleArray(raw)
  if (direct.length > 0) return direct

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    const nestedKeys = ['results', 'data', 'schedule', 'schedules', 'items']

    for (const key of nestedKeys) {
      const current = asScheduleArray(record[key])
      if (current.length > 0) return current
    }
  }

  return []
}

function formatTimeRange(
  start?: string,
  end?: string,
  fallback?: string
): string {
  if (fallback?.trim()) return fallback
  const parts = [start, end].filter((value): value is string => !!value?.trim())
  return parts.length === 2
    ? `${parts[0]} - ${parts[1]}`
    : parts[0] || 'Vaqti belgilanmagan'
}

function normalizeLessonStatus(status?: string): string {
  if (!status) return 'Faol'

  const normalized = status.toLowerCase()
  if (normalized === 'ongoing') return 'Davom etmoqda'
  if (normalized === 'upcoming') return 'Kutilmoqda'
  if (normalized === 'completed') return 'Tugagan'

  return status
}

function normalizeStudentScheduleItem(
  item: StudentScheduleApiItem
): StudentScheduleItem {
  const rawDays = item.week_days_names || item.days || []
  const formattedDaysString = formatLessonDays(rawDays)
  const cleanDays = formattedDaysString === 'No lesson days available' 
    ? [] 
    : formattedDaysString.split(', ')

  return {
    id: item.id ?? 0,
    title:
      item.title ||
      item.name ||
      item.group_name ||
      item.course_name ||
      'Dars',
    time: formatTimeRange(item.start_time, item.end_time, item.time),
    week_days_type: item.week_days_type || 'Dars jadvali',
    week_days_names: cleanDays,
    status: normalizeLessonStatus(item.status || item.lesson_status),
    start_date: item.start_date || '-',
    end_date: item.end_date || '-',
  }
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
  const stored = getStoredUser()
  return {
    id: stored?.id ?? 0,
    username: stored?.username || '',
    full_name: stored?.full_name || '',
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
    queryFn: async () => buildProfile(),
    staleTime: 60_000,
  })
}

export const useStudentDashboard = () => {
  const { data: unreadRes } = useStudentUnreadCount()
  const unreadCount = unreadRes?.unread_count ?? 0

  return useQuery({
    queryKey: ['student', 'dashboard', unreadCount],
    queryFn: async () => {
      const profile = buildProfile()
      const completedHours = `${Math.max(40, Math.round(profile.completion * 0.8))}h`

      return {
        stats: {
          upcomingLessons: 3,
          completedHours,
          progress: profile.completion,
          unreadMessages: unreadCount,
        } as StudentDashboardStats,
        highlights: [
          {
            title: 'Next lesson',
            value: profile.nextLesson,
          },
          {
            title: 'Current course',
            value: profile.activeCourse,
          },
          {
            title: 'Learning streak',
            value: `${profile.streak} days`,
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
    queryFn: async (): Promise<StudentScheduleItem[]> => {
      const data = await apiClient.get<unknown>(GROUP.MY_SCHEDULE)
      return unwrapSchedule(data).map(normalizeStudentScheduleItem)
    },
    staleTime: 60_000,
  })
}

export const useStudentHomework = () => {
  return useQuery({
    queryKey: ['student', 'homework'],
    queryFn: async (): Promise<Assignment[]> => {
      const data = await getMyAssignments()
      return data || []
    },
    staleTime: 60_000,
  })
}

export const useSubmitHomework = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SubmitAssignmentPayload | FormData }) =>
      submitAssignment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'homework'] })
    },
  })
}

export const useStudentMessages = () => {
  return useQuery({
    queryKey: ['student', 'messages'],
    queryFn: async (): Promise<StudentConversation[]> => {
      const res = await apiClient.get<any[]>(MESSAGES.GROUPS)
      return (res || []).map((c: any) => ({
        id: c.id,
        participant: c.group_name || 'Guruh',
        subject: 'Guruh xabari',
        lastMessage: c.last_message?.text || 'Xabarlar yo\'q',
        time: c.last_message?.created_at ? formatRelativeTime(c.last_message.created_at) : '',
        unread: c.unread_count || 0,
        messages: []
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
