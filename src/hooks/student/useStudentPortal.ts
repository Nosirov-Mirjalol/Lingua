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
  const normalized = String(status).toLowerCase()
  if (normalized === 'ongoing') return 'Davom etmoqda'
  if (normalized === 'upcoming') return 'Kutilmoqda'
  if (normalized === 'completed') return 'Tugagan'
  return status
}

function normalizeStudentScheduleItem(
  item: Record<string, unknown>
): StudentScheduleItem {
  const rawDays =
    (item.week_days_names as string[] | undefined) ||
    (item.days as string[] | undefined) ||
    []
  const formattedDaysString = formatLessonDays(rawDays)
  const cleanDays =
    formattedDaysString === 'No lesson days available'
      ? []
      : formattedDaysString.split(', ')

  return {
    id: (item.id as number) ?? 0,
    title:
      (item.title as string) ||
      (item.name as string) ||
      (item.group_name as string) ||
      (item.course_name as string) ||
      'Dars',
    time: formatTimeRange(
      item.start_time as string | undefined,
      item.end_time as string | undefined,
      item.time as string | undefined
    ),
    week_days_type: (item.week_days_type as string) || 'Dars jadvali',
    week_days_names: cleanDays,
    status: normalizeLessonStatus(
      (item.status as string) || (item.lesson_status as string)
    ),
    start_date: (item.start_date as string) || '-',
    end_date: (item.end_date as string) || '-',
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
    data?.learning_goal && data.learning_goal !== 'string'
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
        const profileData = unwrapSingle<Record<string, unknown>>(response)

        if (profileData) {
          const current = getStoredUser()
          const updated = { ...current, ...profileData }
          sessionStorage.setItem('linguapro_user', JSON.stringify(updated))
          return buildProfile(profileData)
        }
      } catch {
        /* API xatosi — buildProfile() fallback ishlatiladi */
      }
      return buildProfile()
    },
    // ✅ FIX: Ko'p so'rovlar muammosi hal qilindi
    staleTime: 5 * 60 * 1000, // 5 daqiqa cache — bu vaqt ichida qayta so'rov yo'q
    gcTime: 10 * 60 * 1000, // 10 daqiqa xotirada saqlash
    refetchOnWindowFocus: false, // Oynaga qaytganda qayta so'rov yubormaslik
    refetchOnMount: false, // Cache bo'lsa mountda qayta yuklamaslik
  })
}

export const useStudentDashboard = () => {
  const { data: unreadRes } = useStudentUnreadCount()
  const unreadCount = unreadRes?.unread_count ?? 0
  const { data: schedule } = useStudentSchedule()
  const { data: homework } = useStudentHomework()
  const { data: groups } = useStudentGroups()

  return useQuery({
    // ✅ FIX: profile?.id ni dependency dan olib tashladik — profile o'zgarganda
    // dashboard qayta hisoblanmaydi, faqat unreadCount o'zgarganda
    queryKey: ['student', 'dashboard', unreadCount, schedule, homework, groups],
    queryFn: async () => {
      const upcomingLessonsCount =
        schedule?.filter((s) => s.status === 'Kutilmoqda').length ?? 0

      // Uy vazifalari statistikasi
      const totalHomework = homework?.length ?? 0
      const submittedHomework =
        homework?.filter((h) => h.is_submitted || !!h.submitted_at).length ?? 0

      // Dars kunlari ma'lumotlari
      const lessonDays =
        groups?.[0]?.week_days_names?.join(', ') ||
        'Seshanba, Payshanba, Shanba'
      const firstGroupName = groups?.[0]?.name || 'Guruh mavjud emas'
      const firstTeacherName =
        groups?.[0]?.teacher?.full_name ||
        groups?.[0]?.teacher_name ||
        'Ustoz belgilanmagan'

      // Kurs davomiyligini (jami kunlarni) hisoblash - guruh boshlanish va tugash sanalaridan
      const groupStartDate = groups?.[0]?.start_date
      const groupEndDate = groups?.[0]?.end_date
      let totalDays = 89 // Default: 3 months (approximate)

      if (groupStartDate && groupEndDate) {
        try {
          const startDate = new Date(groupStartDate)
          const endDate = new Date(groupEndDate)
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
          totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        } catch {
          // Date parsing failed, use default
        }
      }

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
          },
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
      return unwrap<Record<string, unknown>>(data, [
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
      const data = unwrap<Record<string, unknown>>(res, [
        'results',
        'data',
        'groups',
        'conversations',
      ])
      return data.map((c: Record<string, unknown>) => ({
        id: c.id as number,
        participant: (c.group_name as string) || 'Guruh',
        subject: 'Guruh xabari',
        lastMessage:
          ((c.last_message as Record<string, unknown>)?.text as string) ||
          "Xabarlar yo'q",
        time: (c.last_message as Record<string, unknown>)?.created_at
          ? formatRelativeTime(
              (c.last_message as Record<string, unknown>).created_at as string
            )
          : '',
        unread: (c.unread_count as number) || 0,
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
