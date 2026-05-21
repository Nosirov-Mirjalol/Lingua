import { apiClient } from '@/api/client'
import { COURSE } from '@/constants/apiEndPoints'

export type AdminCourse = {
  id: number
  name: string
}

/** Backend enum nomi `couser_objective` (API dagi yozuv) */
export type AdminCourseObjective =
  | 'ielts'
  | 'toefl'
  | 'general'
  | 'kids'
  | 'business'

export type AdminCourseLevel = 'beginner' | 'intermediate' | 'advanced'

export type AdminCourseCreatePayload = {
  name: string
  description?: string
  couser_objective?: AdminCourseObjective
  level?: AdminCourseLevel
  duration_months?: number
  price?: string
}

export type AdminCourseUpdatePayload = Partial<AdminCourseCreatePayload>

function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (
    raw &&
    typeof raw === 'object' &&
    Array.isArray((raw as { results?: unknown }).results)
  )
    return (raw as { results: T[] }).results
  return []
}

export const getAdminCourses = (q?: string): Promise<AdminCourse[]> => {
  const search = q?.trim() ?? ''
  return apiClient
    .get<unknown>(COURSE.LIST, {
      params: search ? { search } : undefined,
    })
    .then((raw) => unwrapList<AdminCourse>(raw))
}

export const createAdminCourse = (
  data: AdminCourseCreatePayload
): Promise<AdminCourse> => {
  const desc = data.description?.trim()
  const payload = {
    name: data.name.trim(),
    description: desc && desc.length > 0 ? desc : '-',
    couser_objective: data.couser_objective ?? 'general',
    level: data.level ?? 'beginner',
    duration_months: data.duration_months ?? 1,
    price: data.price ?? '0',
    is_active: true,
  }

  return apiClient.post<AdminCourse>(COURSE.CREATE, payload)
}

export const updateAdminCourse = (
  courseId: number,
  data: AdminCourseUpdatePayload
): Promise<AdminCourse> => {
  return apiClient.put<AdminCourse>(
    `/api/courses/update-delete/${courseId}`,
    data
  )
}

export const deleteAdminCourse = (courseId: number): Promise<unknown> => {
  return apiClient.delete<unknown>(COURSE.UPDATE_DELETE(courseId))
}
