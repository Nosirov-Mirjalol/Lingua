import { apiClient } from '@/api/client'
import { COURSE } from '@/constants/apiEndPoints'
import { getFullAvatarUrl } from '@/lib/avatar-url'

export type AdminCourse = {
  id: number
  name: string
  description?: string
  image?: string | null
  couser_objective?: AdminCourseObjective
  level?: AdminCourseLevel
  duration_months?: number
  price?: string
  is_active?: boolean
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
  image?: File
}

export type AdminCourseUpdatePayload = Partial<AdminCourseCreatePayload>

const IMAGE_FIELD_KEYS = [
  'image',
  'cover_image',
  'cover',
  'thumbnail',
  'banner',
  'course_image',
  'photo',
  'picture',
] as const

function extractMediaPath(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>
    if (typeof o.url === 'string' && o.url.trim()) return o.url.trim()
    if (typeof o.image === 'string' && o.image.trim()) return o.image.trim()
  }
  return null
}

function pickImagePath(raw: Record<string, unknown>): string | null {
  for (const key of IMAGE_FIELD_KEYS) {
    const path = extractMediaPath(raw[key])
    if (path) return path
  }
  return null
}

export function resolveCourseImageUrl(
  course: AdminCourse | Record<string, unknown>
): string | null {
  const raw =
    course && typeof course === 'object'
      ? (course as Record<string, unknown>)
      : {}
  const path =
    (typeof course.image === 'string' && course.image.trim()
      ? course.image.trim()
      : null) ?? pickImagePath(raw)
  return path ? getFullAvatarUrl(path) : null
}

function normalizeAdminCourse(raw: unknown): AdminCourse | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = typeof r.id === 'number' ? r.id : Number(r.id)
  if (!Number.isFinite(id)) return null

  const name = typeof r.name === 'string' ? r.name : String(r.name ?? '')
  const duration =
    typeof r.duration_months === 'number'
      ? r.duration_months
      : Number.isFinite(Number(r.duration_months))
        ? Number(r.duration_months)
        : undefined

  return {
    id,
    name,
    description:
      typeof r.description === 'string' ? r.description : undefined,
    image: pickImagePath(r),
    couser_objective: r.couser_objective as AdminCourseObjective | undefined,
    level: r.level as AdminCourseLevel | undefined,
    duration_months: duration,
    price: r.price != null ? String(r.price) : undefined,
    is_active:
      typeof r.is_active === 'boolean'
        ? r.is_active
        : r.is_active != null
          ? Boolean(r.is_active)
          : undefined,
  }
}

function unwrapList(raw: unknown): AdminCourse[] {
  const items: unknown[] = Array.isArray(raw)
    ? raw
    : raw &&
        typeof raw === 'object' &&
        Array.isArray((raw as { results?: unknown }).results)
      ? (raw as { results: unknown[] }).results
      : []

  return items
    .map(normalizeAdminCourse)
    .filter((c): c is AdminCourse => c !== null)
}

function buildCourseBody(data: AdminCourseCreatePayload): Record<string, unknown> {
  const desc = data.description?.trim()
  return {
    name: data.name.trim(),
    description: desc && desc.length > 0 ? desc : '-',
    couser_objective: data.couser_objective ?? 'general',
    level: data.level ?? 'beginner',
    duration_months: data.duration_months ?? 1,
    price: data.price ?? '0',
    is_active: true,
  }
}

export const getAdminCourseById = async (
  courseId: number
): Promise<AdminCourse | null> => {
  try {
    const raw = await apiClient.get<unknown>(
      COURSE.UPDATE_DELETE(courseId)
    )
    return normalizeAdminCourse(raw)
  } catch {
    return null
  }
}

export const getAdminCourses = (q?: string): Promise<AdminCourse[]> => {
  const search = q?.trim() ?? ''
  return apiClient
    .get<unknown>(COURSE.LIST, {
      params: search ? { search } : undefined,
    })
    .then((raw) => unwrapList(raw))
}

async function uploadCourseImage(
  courseId: number,
  file: File
): Promise<AdminCourse | null> {
  const attempts = ['image', 'cover_image', 'course_image'] as const
  for (const field of attempts) {
    const formData = new FormData()
    formData.append(field, file)
    try {
      const raw = await apiClient.put<unknown>(
        COURSE.UPDATE_DELETE(courseId),
        formData
      )
      const normalized = normalizeAdminCourse(raw)
      if (normalized?.image) return normalized
    } catch {
      /* keyingi maydon nomi */
    }
  }
  return null
}

export const createAdminCourse = async (
  data: AdminCourseCreatePayload
): Promise<AdminCourse> => {
  const payload = buildCourseBody(data)

  const raw = await apiClient.post<unknown>(COURSE.CREATE, payload)
  let normalized = normalizeAdminCourse(raw)

  if (data.image && normalized?.id) {
    try {
      const withImage = await uploadCourseImage(normalized.id, data.image)
      if (withImage?.image) normalized = { ...normalized, ...withImage }
    } catch {
      /* kurs yaratildi; rasm alohida yuklanmadi */
    }
  }

  if (normalized) return normalized
  return raw as AdminCourse
}

export const updateAdminCourse = async (
  courseId: number,
  data: AdminCourseUpdatePayload
): Promise<AdminCourse> => {
  const { image, ...rest } = data

  if (image) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) formData.append(key, String(value))
    }
    formData.append('image', image)
    const raw = await apiClient.put<unknown>(
      `/api/courses/update-delete/${courseId}`,
      formData
    )
    return (
      normalizeAdminCourse(raw) ?? ({ id: courseId, name: rest.name ?? '' } as AdminCourse)
    )
  }

  return apiClient.put<AdminCourse>(
    `/api/courses/update-delete/${courseId}`,
    rest
  )
}

export const deleteAdminCourse = (courseId: number): Promise<unknown> => {
  return apiClient.delete<unknown>(COURSE.UPDATE_DELETE(courseId))
}
