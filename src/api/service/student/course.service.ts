import { apiClient } from '@/api/client'
import type { ApiError } from '@/api/client'
import { COURSE, GROUP } from '@/constants/apiEndPoints'
import type { StudentCourse } from '@/types/student'

type RawCourse = Record<string, unknown>
type RawGroup = Record<string, unknown>

function asCourseArray(value: unknown): RawCourse[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is RawCourse => !!item && typeof item === 'object'
  )
}

function asGroupArray(value: unknown): RawGroup[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is RawGroup => !!item && typeof item === 'object'
  )
}

function unwrapList(raw: unknown): RawCourse[] {
  const direct = asCourseArray(raw)
  if (direct.length > 0) return direct

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    const nestedKeys = ['results', 'data', 'courses', 'items']

    for (const key of nestedKeys) {
      const current = asCourseArray(record[key])
      if (current.length > 0) return current

      if (record[key] && typeof record[key] === 'object') {
        const nested = unwrapList(record[key])
        if (nested.length > 0) return nested
      }
    }

    for (const value of Object.values(record)) {
      if (value && typeof value === 'object') {
        const nested = unwrapList(value)
        if (nested.length > 0) return nested
      }
      if (Array.isArray(value)) {
        const current = asCourseArray(value)
        if (current.length > 0) return current
      }
    }
  }

  return []
}

function unwrapGroups(raw: unknown): RawGroup[] {
  const direct = asGroupArray(raw)
  if (direct.length > 0) return direct

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    for (const key of ['results', 'data', 'groups', 'items']) {
      const current = asGroupArray(record[key])
      if (current.length > 0) return current
    }
  }

  return []
}

function readString(value: unknown, fallback = '') {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return fallback
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function readBoolean(value: unknown, fallback = true) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }
  return fallback
}

function formatGroupDescription(group: RawGroup) {
  const parts = [
    readString(group.start_date),
    readString(group.start_time),
    readString(group.end_time),
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' • ') : 'Biriktirilgan guruh'
}

function mapCourse(raw: RawCourse, index: number): StudentCourse {
  const durationMonths =
    readNumber(raw.duration_months) ??
    readNumber(raw.duration) ??
    readNumber(raw.months)

  return {
    id: readNumber(raw.id) ?? index + 1,
    name:
      readString(raw.name) ||
      readString(raw.title) ||
      `Course #${index + 1}`,
    description: readString(raw.description),
    objective:
      readString(raw.couser_objective) ||
      readString(raw.course_objective) ||
      readString(raw.objective) ||
      'general',
    level: readString(raw.level) || 'beginner',
    durationMonths,
    price: readString(raw.price) || '0',
    isActive: readBoolean(raw.is_active, true),
    courseId: readNumber(raw.id),
  }
}

function mapGroupToCourse(raw: RawGroup, index: number): StudentCourse {
  const studentList = Array.isArray(raw.students) ? raw.students : []
  const groupStatus = readString(raw.status, 'active').toLowerCase()

  return {
    id: readNumber(raw.id) ?? index + 1,
    name: readString(raw.name) || `Group #${index + 1}`,
    description: formatGroupDescription(raw),
    objective: 'general',
    level: 'beginner',
    durationMonths: null,
    price: '0',
    isActive: groupStatus === 'active',
    courseId: readNumber(raw.course),
    studentCount: studentList.length,
    startDate: readString(raw.start_date),
    startTime: readString(raw.start_time),
    endTime: readString(raw.end_time),
  }
}

function isForbiddenError(error: unknown): error is ApiError {
  return (
    !!error &&
    typeof error === 'object' &&
    'status' in error &&
    (error as { status?: unknown }).status === 403
  )
}

async function getStudentCoursesFromGroups(): Promise<StudentCourse[]> {
  const raw = await apiClient.get<unknown>(GROUP.MY)
  return unwrapGroups(raw).map(mapGroupToCourse)
}

export const getStudentCourses = async (): Promise<StudentCourse[]> => {
  try {
    const raw = await apiClient.get<unknown>(COURSE.LIST)
    const courses = unwrapList(raw).map(mapCourse)
    if (courses.length > 0) return courses
  } catch (error) {
    if (!isForbiddenError(error)) throw error
  }

  return getStudentCoursesFromGroups()
}
