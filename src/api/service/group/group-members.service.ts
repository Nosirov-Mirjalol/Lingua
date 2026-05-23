/**
 * Group - Admin - Teacher (Swagger)
 * POST   /api/groups/{id}/add-student/
 * GET    /api/groups/{id}/available-students/
 * DELETE /api/groups/{id}/remove-student/{sid}/
 * GET    /api/groups/my/
 * GET    /api/groups/students-list/
 */
import { apiClient } from '@/api/client'
import { GROUP } from '@/constants/apiEndPoints'
import type {
  AddStudentPayload,
  Group,
  GroupStudent,
  MessageResponse,
  StudentListItem,
} from '../teacher/group.type'

export type TeacherListItem = {
  id: number
  username: string
  first_name?: string
  last_name?: string
}

let myGroupsInflight: Promise<Group[]> | null = null

export function resetMyGroupsCache(): void {
  myGroupsInflight = null
}

function normalizeGroupStudent(raw: unknown): GroupStudent | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  let student: number | null = null
  let full_name = typeof r.full_name === 'string' ? r.full_name : undefined
  let username = typeof r.username === 'string' ? r.username : undefined
  const student_name =
    typeof r.student_name === 'string' ? r.student_name : undefined

  if (typeof r.student === 'number' || /^\d+$/.test(String(r.student ?? ''))) {
    student = Number(r.student)
  } else if (r.student && typeof r.student === 'object') {
    const u = r.student as Record<string, unknown>
    student = Number(u.id)
    if (!full_name && typeof u.full_name === 'string') full_name = u.full_name
    if (!username && typeof u.username === 'string') username = u.username
  }

  if ((student == null || !Number.isFinite(student)) && r.student_id != null) {
    student = Number(r.student_id)
  }

  if (
    (student == null || !Number.isFinite(student)) &&
    r.id != null &&
    /^\d+$/.test(String(r.id))
  ) {
    student = Number(r.id)
  }

  if (student == null || !Number.isFinite(student)) return null

  const membershipId =
    typeof r.id === 'number' &&
    r.student != null &&
    Number(r.student) !== Number(r.id)
      ? r.id
      : student

  return {
    id: membershipId,
    student,
    student_name,
    full_name: full_name ?? student_name,
    username,
    joined_at:
      typeof r.joined_at === 'string' ? r.joined_at : new Date().toISOString(),
  }
}

function unwrapStudentArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.results)) return o.results
    if (Array.isArray(o.data)) return o.data
  }
  return []
}

const STUDENT_ARRAY_KEYS = [
  'students',
  'group_students',
  'members',
  'student_list',
  'enrollments',
  'groupstudent_set',
] as const

function extractStudentsFromGroupRecord(
  record: Record<string, unknown>
): GroupStudent[] {
  for (const key of STUDENT_ARRAY_KEYS) {
    const raw = unwrapStudentArray(record[key])
    if (raw.length === 0) continue

    const parsed = raw
      .map((item) =>
        normalizeGroupStudent(
          typeof item === 'object' && item
            ? {
                ...(item as Record<string, unknown>),
                student:
                  (item as Record<string, unknown>).student ??
                  (item as Record<string, unknown>).id,
              }
            : item
        )
      )
      .filter((s): s is GroupStudent => s !== null)

    if (parsed.length > 0) return parsed
  }
  return []
}

function unwrapArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (
    raw &&
    typeof raw === 'object' &&
    Array.isArray((raw as { results?: unknown }).results)
  ) {
    return (raw as { results: T[] }).results
  }
  return []
}

function normalizeGroup(raw: unknown): Group | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = typeof r.id === 'number' ? r.id : Number(r.id)
  if (!Number.isFinite(id)) return null

  const course = Number(r.course)
  const teacher = Number(r.teacher)

  return {
    id,
    name: String(r.name ?? ''),
    course: Number.isFinite(course) ? course : 0,
    teacher: Number.isFinite(teacher) ? teacher : 0,
    teacher_name:
      typeof r.teacher_name === 'string' ? r.teacher_name : undefined,
    status: (r.status === 'completed' ? 'completed' : 'active') as Group['status'],
    start_date: String(r.start_date ?? ''),
    start_time: typeof r.start_time === 'string' ? r.start_time : undefined,
    end_time: typeof r.end_time === 'string' ? r.end_time : undefined,
    week_days: r.week_days as Group['week_days'],
    week_days_type: r.week_days_type as Group['week_days_type'],
    students: extractStudentsFromGroupRecord(r),
  }
}

/** GET /api/groups/my/ */
export async function fetchMyGroups(): Promise<Group[]> {
  if (myGroupsInflight) return myGroupsInflight

  myGroupsInflight = apiClient
    .get<unknown>(GROUP.MY)
    .then((raw) =>
      unwrapArray(raw)
        .map(normalizeGroup)
        .filter((g): g is Group => g !== null)
    )
    .finally(() => {
      myGroupsInflight = null
    })

  return myGroupsInflight
}

/**
 * Guruhda bo'lgan talabalar:
 * 1) GET /api/groups/my/ → students[]
 * 2) Agar bo'sh: students-list MINUS available-students (guruhda yo'q = guruhda bor)
 */
export async function fetchGroupEnrolledStudents(
  groupId: number
): Promise<GroupStudent[]> {
  const gid = Number(groupId)
  const myGroups = await fetchMyGroups()
  const fromMy =
    myGroups.find((g) => Number(g.id) === gid)?.students ?? []
  if (fromMy.length > 0) return fromMy

  const [allStudents, available] = await Promise.all([
    fetchStudentsList(),
    fetchAvailableStudents(groupId),
  ])
  const availIds = new Set(available.map((s) => s.id))
  return allStudents
    .filter((s) => !availIds.has(s.id))
    .map((item) => studentListItemToGroupMember(item))
}

export function pickGroupStudents(
  groups: Group[],
  groupId: number
): GroupStudent[] {
  return groups.find((g) => Number(g.id) === Number(groupId))?.students ?? []
}

/** GET /api/groups/students-list/ */
export async function fetchStudentsList(
  search?: string
): Promise<StudentListItem[]> {
  const raw = await apiClient.get<unknown>(GROUP.STUDENTS_LIST, {
    params: search?.trim() ? { search: search.trim() } : undefined,
  })
  return unwrapArray<StudentListItem>(raw)
}

/** GET /api/groups/teachers-list/ */
export async function fetchTeachersList(
  search?: string
): Promise<TeacherListItem[]> {
  const raw = await apiClient.get<unknown>(GROUP.TEACHER_LIST, {
    params: search?.trim() ? { search: search.trim() } : undefined,
  })
  return unwrapArray<TeacherListItem>(raw)
}

/** GET /api/groups/{id}/available-students/ */
export async function fetchAvailableStudents(
  groupId: number,
  search?: string
): Promise<StudentListItem[]> {
  const raw = await apiClient.get<unknown>(GROUP.AVAILABLE_STUDENTS(groupId), {
    params: search?.trim() ? { search: search.trim() } : undefined,
  })
  return unwrapArray<StudentListItem>(raw)
}

/** POST /api/groups/{id}/add-student/ */
export async function addStudentToGroupApi(
  groupId: number,
  payload: AddStudentPayload
): Promise<MessageResponse> {
  const username = payload.username?.trim()
  if (!username) {
    throw new Error('API: faqat username yuboriladi')
  }

  const res = await apiClient.post<MessageResponse>(GROUP.ADD_STUDENT(groupId), {
    username,
  })

  resetMyGroupsCache()

  const available = await fetchAvailableStudents(groupId)
  const stillAvailable = available.some(
    (s) => s.username?.trim().toLowerCase() === username.toLowerCase()
  )
  if (stillAvailable) {
    throw new Error(
      "Talaba qo'shilmadi — server available ro'yxatida qolgan."
    )
  }

  return res
}

/** DELETE /api/groups/{id}/remove-student/{sid}/ */
export async function removeStudentFromGroupApi(
  groupId: number,
  studentUserId: number
): Promise<MessageResponse> {
  const res = await apiClient.delete<MessageResponse>(
    GROUP.REMOVE_STUDENT(groupId, studentUserId)
  )
  resetMyGroupsCache()
  return res
}

/**
 * Barcha guruhlar bo'yicha kamida bitta guruhga biriktirilgan talaba id lari.
 * my/ bo'sh bo'lsa: students-list − available-students (har bir guruh uchun).
 */
export async function fetchEnrolledStudentUserIds(
  groupIds: number[]
): Promise<Set<number>> {
  const enrolled = new Set<number>()
  const ids = groupIds.filter((id) => Number.isFinite(id) && id > 0)
  if (ids.length === 0) return enrolled

  const myGroups = await fetchMyGroups()
  const myById = new Map(myGroups.map((g) => [Number(g.id), g]))
  const needsFallback: number[] = []

  for (const gid of ids) {
    const fromMy = myById.get(gid)?.students ?? []
    if (fromMy.length > 0) {
      for (const m of fromMy) {
        if (m.student != null && Number.isFinite(m.student)) {
          enrolled.add(m.student)
        }
      }
    } else {
      needsFallback.push(gid)
    }
  }

  if (needsFallback.length === 0) return enrolled

  const allStudents = await fetchStudentsList()
  const allIds = allStudents.map((s) => s.id)

  await Promise.all(
    needsFallback.map(async (gid) => {
      const available = await fetchAvailableStudents(gid)
      const availIds = new Set(available.map((s) => s.id))
      for (const sid of allIds) {
        if (!availIds.has(sid)) enrolled.add(sid)
      }
    })
  )

  return enrolled
}

export function studentListItemToGroupMember(
  item: StudentListItem
): GroupStudent {
  return {
    id: item.id,
    student: item.id,
    full_name: item.full_name ?? undefined,
    username: item.username,
    joined_at: new Date().toISOString(),
  }
}
