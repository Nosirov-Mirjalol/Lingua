import { apiClient } from '@/api/client'
import type { ApiError } from '@/api/client'
import { STUDENT } from '@/constants/apiEndPoints'
import type { StudentCourse } from '@/types/student'

type RawGroup = Record<string, unknown>

function asGroupArray(value: unknown): RawGroup[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is RawGroup => !!item && typeof item === 'object'
  )
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

export const getStudentCourses = async (): Promise<StudentCourse[]> => {
  const raw = await apiClient.get<unknown>(STUDENT.ASSIGNED_GROUPS)
  return unwrapGroups(raw).map(mapGroupToCourse)
}
