import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMyAssignments,
  submitAssignment,
} from '@/services/assignment.service'
import type {
  Assignment,
  SubmitAssignmentPayload,
} from '@/types/assignment.types'
import type {
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
import { formatLessonDays } from '@/lib/formatters'
import { AUTH, GROUP, MESSAGES } from '@/constants/apiEndPoints'
import { useStudentUnreadCount } from './useStudentNotifications'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unwrap<T>(
  raw: unknown,
  nestedKeys: string[] = ['results', 'data', 'items', 'groups', 'schedule']
): T[] {
  if (Array.isArray(raw)) return raw as T[]

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>

    for (const key of nestedKeys) {
      if (Array.isArray(record[key])) {
        return record[key] as T[]
      }
    }

    if (Object.keys(record).length > 0 && !record.results && !record.data) {
      if ('id' in record || 'name' in record || 'title' in record) {
        return [record as unknown as T]
      }
    }
  }

  return []
}

function unwrapSingle<T>(
  raw: unknown,
  nestedKeys: string[] = ['results', 'data', 'profile', 'user', 'User Data']
): T | null {
  if (!raw) return null

  if (Array.isArray(raw)) {
    return raw.length > 0 ? (raw[0] as T) : null
  }

  if (typeof raw === 'object') {
    const record = raw as Record<string, unknown>

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
  const cleanDays =
    formattedDaysString === 'No lesson days available'
      ? []
      : formattedDaysString.split(', ')

  return {
    id: item.id ?? 0,
    title:
      item.title || item.name || item.group_name || item.course_name || 'Dars',
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

  const username =
    data?.username && data.username !== 'string' ? data.username : ''
  const full_name =
    data?.full_name && data.full_name !== 'string' ? data.full_name : ''
  const timezone =
    data?.timezone && data.timezone !== 'string' ? data.timezone : ''
  const bio = data?.bio && data.bio !== 'string' ? data.bio : ''
  const learning_goal =
    data?.learning_goal && data.learning_goal !== 'string' && data.learning_goal !== 'fsdfds'
      ? data.learning_goal
      : 'Ingliz tilida erkin so‘zlashish va barcha ko‘nikmalarni mukammal rivojlantirish'

  return {
    id: data?.id ?? 0,
    username: username || '',
    full_name: full_name || '',
    role: data?.role ?? 'student',
    avatar: data?.avatar || '',
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
        // ✅ Cache buster olib tashlandi — React Query o'zi cache boshqaradi
        const response = await apiClient.get<unknown>(AUTH.PROFILE_GET)
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
    // ✅ FIX: Ko'p so'rovlar muammosi hal qilindi
    staleTime: 5 * 60 * 1000,      // 5 daqiqa cache — bu vaqt ichida qayta so'rov yo'q
    gcTime: 10 * 60 * 1000,        // 10 daqiqa xotirada saqlash
    refetchOnWindowFocus: false,    // Oynaga qaytganda qayta so'rov yubormaslik
    refetchOnMount: false,          // Cache bo'lsa mountda qayta yuklamaslik
  })
}

export const useStudentDashboard = () => {
  const { data: unreadRes } = useStudentUnreadCount()
  const unreadCount = unreadRes?.unread_count ?? 0
  const { data: profile } = useStudentProfile()
  const { data: schedule } = useStudentSchedule()
  const { data: homework } = useStudentHomework()
  const { data: groups } = useStudentGroups()

  return useQuery({
    queryKey: ['student', 'dashboard', unreadCount, profile?.id, schedule?.length, homework?.length, groups?.length],
    queryFn: async () => {
      const activeProfile = profile || buildProfile()
      
      const upcomingLessonsCount = schedule?.filter(s => s.status === 'Kutilmoqda').length ?? 0
      
      // Uy vazifalari statistikasi
      const totalHomework = homework?.length ?? 0
      const submittedHomework = homework?.filter(h => h.is_submitted === true || !!h.submitted_at).length ?? 0

      // Dars kunlari ma'lumotlari
      const lessonDays = groups?.[0]?.week_days_names?.join(', ') || 'Seshanba, Payshanba, Shanba'
      const firstGroupName = groups?.[0]?.name || 'Guruh mavjud emas'
      const firstTeacherName = groups?.[0]?.teacher?.full_name || groups?.[0]?.teacher_name || 'Ustoz belgilanmagan'

      // Kurs davomiyligini (jami kunlarni) hisoblash (2026-02-10 dan 2026-05-10 gacha)
      const startDate = new Date('2026-02-10')
      const endDate = new Date('2026-05-10')
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return {
        stats: {
          upcomingLessons: upcomingLessonsCount,
          lessonDays: lessonDays,
          unreadMessages: unreadCount,
          activeGroupsCount: groups?.length ?? 0,
          durationDays: totalDays, // Jami kunlarni ko'rsatamiz
          mainGroupName: firstGroupName,
          mainTeacherName: firstTeacherName,
        } as StudentDashboardStats,
        highlights: [
          {
            title: 'Active course',
            value: firstGroupName,
          },
          {
            title: 'Topshirilgan vazifalar',
            value: `${submittedHomework} / ${totalHomework}`,
          }
        ],
        quickActions: [
          {
            label: 'Check Homework',
            description: 'View assigned tasks',
            path: '/student/homework',
          },
        ],
      }
    },
    staleTime: 30_000,
  })
}

export const useStudentSchedule = () => {
  return useQuery({
    queryKey: ['student', 'schedule'],
    queryFn: async (): Promise<StudentScheduleItem[]> => {
      const data = await apiClient.get<unknown>(GROUP.MY_SCHEDULE)
      return unwrap<any>(data, [
        'results',
        'data',
        'schedule',
        'schedules',
      ]).map(normalizeStudentScheduleItem)
    },
    staleTime: 60_000,
  })
}

export const useStudentHomework = () => {
  return useQuery({
    queryKey: ['student', 'homework'],
    queryFn: async (): Promise<Assignment[]> => {
      const data = await getMyAssignments()
      return unwrap<Assignment>(data, [
        'results',
        'data',
        'assignments',
        'items',
      ])
    },
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export const useSubmitHomework = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: SubmitAssignmentPayload | FormData
    }) => submitAssignment(id, payload),
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
      const data = unwrap<any>(res, [
        'results',
        'data',
        'groups',
        'conversations',
      ])
      return data.map((c: any) => ({
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
    queryFn: async (): Promise<StudentGroup[]> => {
      const data = await getMyGroups()
      return unwrap<StudentGroup>(data, [
        'results',
        'data',
        'groups',
        'assigned_groups',
        'my_groups',
      ])
    },
    staleTime: 60_000,
  })
}