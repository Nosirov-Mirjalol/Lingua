import { apiClient } from '@/api/client'
import type { Group, MessageResponse } from '@/api/service/teacher/group.type'
import { GROUP } from '@/constants/apiEndPoints'

export type AdminGroupCreatePayload = {
  name: string
  course: number
  /** O'qituvchi user nomi (slug/username) — API ko'pincha teacher ID emas, username kutadi */
  teacherUsername: string
  start_date: string
  /** HH:MM:SS — backend talabi */
  start_time?: string
  /** HH:MM:SS — backend talabi */
  end_time?: string
  /** Qator yoki JSON massiv — backend qaysi formatni qabul qilsa */
  week_days?: string | string[]
}

export type AdminGroupUpdatePayload = Partial<AdminGroupCreatePayload>

function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (raw && typeof raw === 'object' && Array.isArray((raw as { results?: unknown }).results))
    return (raw as { results: T[] }).results
  return []
}

export const getAdminGroups = (): Promise<Group[]> => {
  return apiClient.get<unknown>(GROUP.LIST_ADMIN).then((raw) => unwrapList<Group>(raw))
}

export const createAdminGroup = (
  data: AdminGroupCreatePayload
): Promise<Group> => {
  // Validation
  if (!data.name?.trim()) {
    throw new Error('Guruh nomi kiritilmadi')
  }

  const courseId = Number(data.course)
  if (!Number.isInteger(courseId) || courseId <= 0) {
    throw new Error("Course ID noto'g'ri. Iltimos, mavjud course ID kiriting.")
  }

  const teacherUsername = data.teacherUsername?.trim()
  if (!teacherUsername) {
    throw new Error(
      "O'qituvchi username kiritilmadi (masalan: ali_teacher)."
    )
  }

  if (!data.start_date?.trim()) {
    throw new Error('Boshlanish sanasi kiritilmadi')
  }

  const startDate = data.start_date.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error("Sana formati xato. To'g'ri format: YYYY-MM-DD")
  }

  const startTime = data.start_time?.trim() || '09:00:00'
  const endTime = data.end_time?.trim() || '10:30:00'
  const wd = data.week_days
  const week_days: string =
    wd === undefined
      ? 'Mon,Tue,Wed,Thu,Fri'
      : typeof wd === 'string'
        ? wd.trim() || 'Mon,Tue,Wed,Thu,Fri'
        : wd.join(',')

  const payload = {
    name: data.name.trim(),
    course: courseId,
    teacher_username: teacherUsername,
    start_date: startDate,
    start_time: startTime,
    end_time: endTime,
    week_days,
  }

  return apiClient.post<Group>(GROUP.CREATE_ADMIN, payload)
}

export const updateAdminGroup = (
  groupId: number,
  data: AdminGroupUpdatePayload
): Promise<Group> => {
  // Faqat mavjud (undefined bo'lmagan) maydonlarni yuborish
  const payload: Record<string, unknown> = {}

  if (data.name !== undefined) payload.name = data.name.trim()
  if (data.course !== undefined) payload.course = Number(data.course)
  if (data.teacherUsername !== undefined) {
    const u = data.teacherUsername.trim()
    if (u) payload.teacher_username = u
  }
  if (data.start_date !== undefined) payload.start_date = data.start_date.trim()

  return apiClient.put<Group>(GROUP.UPDATE_DELETE_ADMIN(groupId), payload)
}

export const deleteAdminGroup = (groupId: number): Promise<MessageResponse> => {
  return apiClient.delete<MessageResponse>(GROUP.UPDATE_DELETE_ADMIN(groupId))
}
