import { apiClient } from '../../client'
import { GROUP } from '@/constants/apiEndPoints'
import { getTeacherGroups } from '../teacher/group.service'
import {
  type AddStudentPayload,
  type Group,
  type GroupStudent,
  type MessageResponse,
  type StudentListItem,
} from '../teacher/group.type'

export interface AdminGroupCreatePayload {
  name: string
  course: number
  teacher: number
  start_date: string
  start_time: string
  end_time: string
  week_days_type: 'toq_kunlar' | 'juft_kunlar' | 'har_kuni'
  status: 'active' | 'completed'
}

export type AdminGroupUpdatePayload = Partial<AdminGroupCreatePayload>

function ensureSeconds(t: string): string {
  return t.split(':').length === 2 ? `${t}:00` : t
}

function normalizeGroupStudent(raw: unknown): GroupStudent | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  let student: number | null = null
  let full_name =
    typeof r.full_name === 'string' ? r.full_name : undefined
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

  if (
    (student == null || !Number.isFinite(student)) &&
    r.student_id != null
  ) {
    student = Number(r.student_id)
  }

  if (student == null || !Number.isFinite(student)) return null

  const membershipId =
    typeof r.id === 'number' && r.student !== undefined ? r.id : student

  return {
    id: membershipId,
    student,
    student_name,
    full_name: full_name ?? student_name,
    username,
    joined_at:
      typeof r.joined_at === 'string'
        ? r.joined_at
        : new Date().toISOString(),
  }
}

function normalizeGroup(raw: unknown): Group | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = typeof r.id === 'number' ? r.id : Number(r.id)
  if (!Number.isFinite(id)) return null

  const course = Number(r.course)
  const teacher = Number(r.teacher)
  const studentsRaw =
    r.students ??
    r.group_students ??
    r.members ??
    r.student_list ??
    r.enrollments
  const students = Array.isArray(studentsRaw)
    ? studentsRaw
        .map(normalizeGroupStudent)
        .filter((s): s is GroupStudent => s !== null)
    : []

  return {
    id,
    name: String(r.name ?? ''),
    course: Number.isFinite(course) ? course : 0,
    teacher: Number.isFinite(teacher) ? teacher : 0,
    teacher_name:
      typeof r.teacher_name === 'string' ? r.teacher_name : undefined,
    status: (r.status === 'completed' ? 'completed' : 'active') as Group['status'],
    start_date: String(r.start_date ?? ''),
    start_time:
      typeof r.start_time === 'string' ? r.start_time : undefined,
    end_time: typeof r.end_time === 'string' ? r.end_time : undefined,
    week_days: r.week_days as Group['week_days'],
    week_days_type: r.week_days_type as Group['week_days_type'],
    students,
  }
}

function unwrapGroups(raw: unknown): Group[] {
  const list = Array.isArray(raw)
    ? raw
    : raw &&
        typeof raw === 'object' &&
        Array.isArray((raw as { results?: unknown }).results)
      ? (raw as { results: unknown[] }).results
      : []
  return list.map(normalizeGroup).filter((g): g is Group => g !== null)
}

function unwrapStudents(raw: unknown): StudentListItem[] {
  if (Array.isArray(raw)) return raw as StudentListItem[]
  if (
    raw &&
    typeof raw === 'object' &&
    Array.isArray((raw as { results?: unknown }).results)
  ) {
    return (raw as { results: StudentListItem[] }).results
  }
  return []
}

export const getAdminGroups = async (): Promise<Group[]> => {
  const raw = await apiClient.get<unknown>('/api/groups/list-admin/')
  return unwrapGroups(raw)
}

/** Guruh + talabalar (GET update-delete ishlatilmaydi — 405) */
export const getAdminGroupWithStudents = async (
  groupId: number
): Promise<Group> => {
  const list = await getAdminGroups()
  let group = list.find((g) => g.id === groupId)

  if (!group?.students?.length) {
    try {
      const myGroups = await getTeacherGroups()
      const fromMy = myGroups.find((g) => g.id === groupId)
      if (fromMy) {
        group = fromMy
      }
    } catch {
      /* admin uchun MY bo'lmasa ham davom etamiz */
    }
  }

  if (group) return group

  return {
    id: groupId,
    name: '',
    course: 0,
    teacher: 0,
    status: 'active',
    start_date: '',
    students: [],
  }
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

export const getAdminGroupAvailableStudents = async (
  groupId: number
): Promise<StudentListItem[]> => {
  const raw = await apiClient.get<unknown>(GROUP.AVAILABLE_STUDENTS(groupId))
  return unwrapStudents(raw)
}

export const addStudentToAdminGroup = async (
  groupId: number,
  payload: AddStudentPayload
): Promise<MessageResponse> => {
  const username = payload.username?.trim()
  if (username) {
    return apiClient.post<MessageResponse>(GROUP.ADD_STUDENT(groupId), {
      username,
    })
  }
  if (payload.student != null) {
    return apiClient.post<MessageResponse>(GROUP.ADD_STUDENT(groupId), {
      student: payload.student,
    })
  }

  return apiClient.post<MessageResponse>(GROUP.ADD_STUDENT(groupId), payload)
}

export const removeStudentFromAdminGroup = async (
  groupId: number,
  studentId: number
): Promise<MessageResponse> => {
  return apiClient.delete<MessageResponse>(
    GROUP.REMOVE_STUDENT(groupId, studentId)
  )
}

export const createAdminGroup = async (
  payload: AdminGroupCreatePayload
): Promise<Group> => {
  const body = {
    name: payload.name,
    course: Number(payload.course),
    teacher: Number(payload.teacher),
    start_date: payload.start_date,
    start_time: ensureSeconds(payload.start_time),
    end_time: ensureSeconds(payload.end_time),
    week_days_type: payload.week_days_type,
    status: payload.status,
  }

  const raw = await apiClient.post<unknown>('/api/groups/create-admin/', body)
  return normalizeGroup(raw) ?? ({ id: 0, name: payload.name, course: body.course, teacher: body.teacher, status: 'active', start_date: payload.start_date, students: [] } as Group)
}

export const updateAdminGroup = async (
  id: number,
  payload: Partial<AdminGroupCreatePayload>
): Promise<Group> => {
  const result: Record<string, unknown> = {}
  if (payload.name !== undefined) result.name = payload.name
  if (payload.course !== undefined) result.course = Number(payload.course)
  if (payload.teacher !== undefined) result.teacher = Number(payload.teacher)
  if (payload.start_date !== undefined) result.start_date = payload.start_date
  if (payload.start_time !== undefined)
    result.start_time = ensureSeconds(payload.start_time)
  if (payload.end_time !== undefined)
    result.end_time = ensureSeconds(payload.end_time)
  if (payload.week_days_type !== undefined)
    result.week_days_type = payload.week_days_type
  if (payload.status !== undefined) result.status = payload.status

  const raw = await apiClient.put<unknown>(
    `/api/groups/update-delete-admin/${id}/`,
    result
  )
  const normalized = normalizeGroup(raw)
  if (normalized) return normalized
  return raw as Group
}

export const deleteAdminGroup = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/groups/update-delete-admin/${id}/`)
}

export const adminGroupService = {
  getGroups: getAdminGroups,
  createGroup: createAdminGroup,
  updateGroup: updateAdminGroup,
  deleteGroup: deleteAdminGroup,
  getAvailableStudents: getAdminGroupAvailableStudents,
  addStudent: addStudentToAdminGroup,
  removeStudent: removeStudentFromAdminGroup,
}
