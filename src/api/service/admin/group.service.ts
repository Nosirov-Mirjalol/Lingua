import { GROUP } from '@/constants/apiEndPoints'
import {
  addStudentToGroupApi,
  fetchAvailableStudents,
  fetchGroupEnrolledStudents,
  fetchMyGroups,
  removeStudentFromGroupApi,
} from '@/api/service/group/group-members.service'
import { apiClient } from '../../client'
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

function normalizeGroupFromAdminList(raw: unknown): Group | null {
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
    students: [],
  }
}

function unwrapAdminList(raw: unknown): Group[] {
  const list = Array.isArray(raw)
    ? raw
    : raw &&
        typeof raw === 'object' &&
        Array.isArray((raw as { results?: unknown }).results)
      ? (raw as { results: unknown[] }).results
      : []
  return list
    .map(normalizeGroupFromAdminList)
    .filter((g): g is Group => g !== null)
}

/** Guruhlar ro'yxati: list-admin + my/ dan students */
export const getAdminGroups = async (): Promise<Group[]> => {
  const [listRaw, myGroups] = await Promise.all([
    apiClient.get<unknown>(GROUP.LIST_ADMIN),
    fetchMyGroups(),
  ])
  const list = unwrapAdminList(listRaw)
  const studentsById = new Map(myGroups.map((g) => [g.id, g.students]))

  return list.map((g) => ({
    ...g,
    students: studentsById.get(g.id) ?? g.students,
  }))
}

/** Guruh + talabalar — my/ yoki students-list − available */
export const getAdminGroupWithStudents = async (
  groupId: number
): Promise<Group> => {
  const [listRaw, students] = await Promise.all([
    apiClient.get<unknown>(GROUP.LIST_ADMIN),
    fetchGroupEnrolledStudents(groupId),
  ])
  const meta = unwrapAdminList(listRaw).find((g) => g.id === groupId)
  if (meta) return { ...meta, students }
  return {
    id: groupId,
    name: '',
    course: 0,
    teacher: 0,
    status: 'active',
    start_date: '',
    students,
  }
}

export const getGroupEnrolledStudents = (groupId: number) =>
  fetchGroupEnrolledStudents(groupId)

export const getAdminGroupAvailableStudents = (
  groupId: number,
  search?: string
): Promise<StudentListItem[]> => fetchAvailableStudents(groupId, search)

/** POST /api/groups/{id}/add-student/ */
export const addStudentToAdminGroup = (
  groupId: number,
  payload: AddStudentPayload
): Promise<MessageResponse> => addStudentToGroupApi(groupId, payload)

/** DELETE /api/groups/{id}/remove-student/{sid}/ */
export const removeStudentFromAdminGroup = (
  groupId: number,
  studentUserId: number
): Promise<MessageResponse> =>
  removeStudentFromGroupApi(groupId, studentUserId)

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

  const raw = await apiClient.post<unknown>(GROUP.CREATE_ADMIN, body)
  const g = normalizeGroupFromAdminList(raw)
  return (
    g ?? {
      id: 0,
      name: payload.name,
      course: body.course,
      teacher: body.teacher,
      status: 'active',
      start_date: payload.start_date,
      students: [],
    }
  )
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
    GROUP.UPDATE_DELETE_ADMIN(id),
    result
  )
  const normalized = normalizeGroupFromAdminList(raw)
  if (normalized) return normalized
  return raw as Group
}

export const deleteAdminGroup = async (id: number): Promise<void> => {
  await apiClient.delete(GROUP.UPDATE_DELETE_ADMIN(id))
}

export { studentListItemToGroupMember } from '@/api/service/group/group-members.service'

export const adminGroupService = {
  getGroups: getAdminGroups,
  createGroup: createAdminGroup,
  updateGroup: updateAdminGroup,
  deleteGroup: deleteAdminGroup,
  getAvailableStudents: getAdminGroupAvailableStudents,
  getEnrolledStudents: getGroupEnrolledStudents,
  addStudent: addStudentToAdminGroup,
  removeStudent: removeStudentFromAdminGroup,
}
