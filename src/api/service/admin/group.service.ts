import { apiClient } from '../../client'
import { type Group } from '../teacher/group.type'

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

export const getAdminGroups = async (): Promise<Group[]> => {
  return await apiClient.get<Group[]>('/api/groups/list-admin/')
}

export const createAdminGroup = async (
  payload: AdminGroupCreatePayload
): Promise<Group> => {
  const ensureSeconds = (t: string) =>
    t.split(':').length === 2 ? `${t}:00` : t

  const buildPayload = () => {
    const result: Record<string, unknown> = {
      name: payload.name,
      course: Number(payload.course),
      teacher: Number(payload.teacher),
      start_date: payload.start_date,
      start_time: ensureSeconds(payload.start_time),
      end_time: ensureSeconds(payload.end_time),
      week_days_type: payload.week_days_type,
      status: payload.status,
    }
    return result
  }

  return await apiClient.post<Group>(
    '/api/groups/create-admin/',
    buildPayload()
  )
}

export const updateAdminGroup = async (
  id: number,
  payload: Partial<AdminGroupCreatePayload>
): Promise<Group> => {
  const ensureSeconds = (t: string) =>
    t.split(':').length === 2 ? `${t}:00` : t

  const buildPayload = () => {
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
    return result
  }

  return await apiClient.put<Group>(
    `/api/groups/update-delete-admin/${id}/`,
    buildPayload()
  )
}

export const deleteAdminGroup = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/groups/update-delete-admin/${id}/`)
}

export const adminGroupService = {
  getGroups: getAdminGroups,
  createGroup: createAdminGroup,
  updateGroup: updateAdminGroup,
  deleteGroup: deleteAdminGroup,
}
