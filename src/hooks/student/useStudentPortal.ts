import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyGroups, type StudentGroup } from '@/api/service/student/group.service'
import { useStudentUnreadCount } from './useStudentNotifications'
import { apiClient } from '@/api/client'
import { GROUP, MESSAGES, AUTH } from '@/constants/apiEndPoints'
import type {
  StudentAssignment,
  StudentConversation,
  StudentDashboardStats,
  StudentProfile,
  StudentScheduleItem,
} from '@/types/student'
import { getMyAssignments, submitAssignment } from '@/services/assignment.service'
import type { Assignment, SubmitAssignmentPayload } from '@/types/assignment.types'
import { formatLessonDays } from '@/lib/formatters'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unwrap<T>(raw: unknown, nestedKeys: string[] = ['results', 'data', 'items', 'groups', 'schedule']): T[] {
  // If it's already an array, return it
  if (Array.isArray(raw)) return raw as T[]

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    
    // Search in provided nested keys
    for (const key of nestedKeys) {
      if (Array.isArray(record[key])) {
        return record[key] as T[]
      }
    }

    // If it's a single object that looks like the type (not an empty object)
    if (Object.keys(record).length > 0 && !record.results && !record.data) {
      // Special case: if it's a single object, we might want to wrap it in an array for list-based hooks
      // But we must be careful not to return the whole response object as a single item if it's metadata
      if ('id' in record || 'name' in record || 'title' in record) {
        return [record as unknown as T]
      }
    }
  }

  return []
}

// Helper to find a single object in a response
function unwrapSingle<T>(raw: unknown, nestedKeys: string[] = ['results', 'data', 'profile', 'user']): T | null {
  if (!raw) return null
  
  // If it's an array, take the first item
  if (Array.isArray(raw)) {
    return raw.length > 0 ? (raw[0] as T) : null
  }

  if (typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    
    // Search in nested keys
    for (const key of nestedKeys) {
      const val = record[key]
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          if (val.length > 0) return val[0] as T
        } else {
          return val as T
        }
      }
    }
    
    // If it's the object itself
    if ('id' in record || 'username' in record || 'full_name' in record) {
      return record as unknown as T
    }
  }

  return null
}

function formatTimeRange(start?: string, end?: string, fallback?: string): string {
  if (fallback?.trim()) return fallback
  const parts = [start, end].filter((value): value is string => !!value?.trim())
  return parts.length === 2
    ? `${parts[0]} - ${parts[1]}`
    : parts[0] || 'Vaqti belgilanmagan'
}

function normalizeLessonStatus(status?: string): string {
  if (!status) return 'Faol'
  const normalized = String(status).toLowerCase()
  if (normalized === 'ongoing') return 'Davom etmoqda'
  if (normalized === 'upcoming') return 'Kutilmoqda'
  if (normalized === 'completed') return 'Tugagan'
  return status
}

function normalizeStudentScheduleItem(item: any): StudentScheduleItem {
  const rawDays = item.week_days_names || item.days || []
  const formattedDaysString = formatLessonDays(rawDays)
  const cleanDays = formattedDaysString === 'No lesson days available' 
    ? [] 
    : formattedDaysString.split(', ')

  return {
    id: item.id ?? 0,
    title: item.title || item.name || item.group_name || item.course_name || 'Dars',
    time: formatTimeRange(item.start_time, item.end_time, item.time),
    week_days_type: item.week_days_type || 'Dars jadvali',
    week_days_names: cleanDays,
    status: normalizeLessonStatus(item.status || item.lesson_status),
    start_date: item.start_date || '-',
    end_date: item.end_date || '-',
  }
}
function formatRelativeTime(iso: string): string {
  try {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return 'Yaqinda'
    
    const diff = Date.now() - date.getTime()
    const m = Math.floor(diff / 60_000)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (m < 1) return 'Hozirgina'
    if (m < 60) return `${m} daqiqa oldin`
    if (h < 24) return `${h} soat oldin`
    return `${d} kun oldin`
  } catch {
    return 'Yaqinda'
  }
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

const buildProfile = (overrides?: Partial<StudentProfile>): StudentProfile => {
  const stored = getStoredUser()
  const data = { ...stored, ...overrides }
  
  // Filter out placeholder "string" values from API
  const username = data?.username && data.username !== 'string' ? data.username : ''
  const full_name = data?.full_name && data.full_name !== 'string' ? data.full_name : ''
  const timezone = data?.timezone && data.timezone !== 'string' ? data.timezone : ''
  const bio = data?.bio && data.bio !== 'string' ? data.bio : ''
  const learning_goal = data?.learning_goal && data.learning_goal !== 'string' ? data.learning_goal : ''
  
  return {
    id: data?.id ?? 0,
    username: username || '',
    full_name: full_name || '',
    role: data?.role ?? 'student',
    avatar: data?.avatar || '/avatars/student1.jpg',
    timezone: timezone || '',
    bio: bio || '',
    learning_goal: learning_goal || '',
    activeCourse: data?.activeCourse || '',
    nextLesson: data?.nextLesson || '',
    completion: data?.completion ?? 0,
    attendance: data?.attendance ?? 0,
    streak: data?.streak ?? 0,
  }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useStudentProfile = () => {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: async (): Promise<StudentProfile> => {
      try {
        // Bypass caching/304 with timestamp and no-cache headers
        const cacheBuster = `t=${Date.now()}`
        const url = AUTH.PROFILE_GET.includes('?') 
          ? `${AUTH.PROFILE_GET}&${cacheBuster}` 
          : `${AUTH.PROFILE_GET}?${cacheBuster}`

        const response = await apiClient.get<unknown>(url)
        const profileData = unwrapSingle<any>(response)
        
        if (profileData) {
          const current = getStoredUser()
          const updated = { ...current, ...profileData }
          sessionStorage.setItem('linguapro_user', JSON.stringify(updated))
          return buildProfile(profileData)
        }
      } catch (error) {
        console.error('Failed to fetch student profile:', error)
      }
      return buildProfile()
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  })
}

export const useStudentDashboard = () => {
  const { data: unreadRes } = useStudentUnreadCount()
  const unreadCount = unreadRes?.unread_count ?? 0
  const { data: profile } = useStudentProfile()

  return useQuery({
    queryKey: ['student', 'dashboard', unreadCount, profile?.id],
    queryFn: async () => {
      const activeProfile = profile || buildProfile()
      const completion = activeProfile.completion ?? 0
      const completedHours = `${Math.max(0, Math.round(completion * 0.8))}h`

      return {
        stats: {
          upcomingLessons: 0,
          completedHours,
          progress: completion,
          unreadMessages: unreadCount,
        } as StudentDashboardStats,
        highlights: [
          {
            title: 'Next lesson',
            value: activeProfile.nextLesson || 'No upcoming lessons',
          },
          {
            title: 'Current course',
            value: activeProfile.activeCourse || 'No active course',
          },
          {
            title: 'Learning streak',
            value: `${activeProfile.streak ?? 0} days`,
          },
        ],
        quickActions: [
          {
            label: 'Review lessons',
            description: 'Check your progress',
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
      return unwrap<any>(data, ['results', 'data', 'schedule', 'schedules']).map(normalizeStudentScheduleItem)
    },
    staleTime: 60_000,
  })
}

export const useStudentHomework = () => {
  return useQuery({
    queryKey: ['student', 'homework'],
    queryFn: async (): Promise<Assignment[]> => {
      const data = await getMyAssignments()
      return unwrap<Assignment>(data, ['results', 'data', 'assignments', 'items'])
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
      const res = await apiClient.get<unknown>(MESSAGES.GROUPS)
      const data = unwrap<any>(res, ['results', 'data', 'groups', 'conversations'])
      return data.map((c: any) => ({
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
    queryFn: async (): Promise<StudentGroup[]> => {
      const data = await getMyGroups()
      // getMyGroups already calls unwrapGroups, but we add an extra safety layer here
      return unwrap<StudentGroup>(data, ['results', 'data', 'groups', 'assigned_groups', 'my_groups'])
    },
    staleTime: 60_000,
  })
}
