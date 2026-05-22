import { apiClient } from '@/api/client'
import type { User } from '@/api/service/teacher/user.type'

export type AdminStudentCreatePayload = {
  username: string
  full_name: string
  phone?: string
  password?: string
  role: 'student'
}

function _parseCreatedUserId(body: unknown): number | null {
  if (!body || typeof body !== 'object') return null
  const r = body as Record<string, unknown>
  const rawId =
    r.id ??
    (r.user && typeof r.user === 'object'
      ? (r.user as Record<string, unknown>).id
      : undefined)
  if (typeof rawId === 'number' && Number.isFinite(rawId)) return rawId
  if (typeof rawId === 'string' && /^\d+$/.test(rawId)) return Number(rawId)
  return null
}

export function getStudentApiErrorMessage(
  error: unknown,
  fallback = 'Xatolik yuz berdi'
): string {
  if (error instanceof Error && error.message) return error.message
  const api = error as { message?: string }
  if (api?.message) return String(api.message)
  return fallback
}

function assertStudentId(studentId: number | string): number {
  const id = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Student ID noto'g'ri")
  }
  return id
}

/**
 * Admin talaba yaratish — POST /api/auth/register/
 */
export const createAdminStudent = async (
  data: AdminStudentCreatePayload
): Promise<User> => {
  if (!data.username?.trim()) throw new Error('Username kiritilmadi')
  if (!data.full_name?.trim()) throw new Error("To'liq ism kiritilmadi")
  if (!data.password?.trim()) throw new Error('Parol kiritilmadi')

  const password = data.password.trim()
  if (password.length < 8)
    throw new Error("Parol kamida 8 belgi bo'lishi kerak")

  // Phone number validation and formatting
  let formattedPhone: string | undefined = undefined
  if (data.phone && data.phone.trim()) {
    const phone = data.phone.trim().replace(/\s/g, '')
    // Remove +998 prefix if present to get just the 9 digits
    const digits = phone.replace(/\+998/, '').replace(/^998/, '')

    // Validate that we have exactly 9 digits
    if (digits.length !== 9 || !/^\d{9}$/.test(digits)) {
      throw new Error(
        "Telefon raqami noto'g'ri formatda. Masalan: +998901234567 yoki 901234567"
      )
    }
    formattedPhone = digits
  }

  const fullName = data.full_name.trim().replace(/\s+/g, ' ')
  const registerPayload: Record<string, unknown> = {
    username: data.username.trim(),
    full_name: fullName,
    phone: formattedPhone,
    password,
    password2: password,
    role: 'student',
  }

  const created = await apiClient.post<unknown>(
    '/api/auth/register/',
    registerPayload
  )

  return created as User
}

/**
 * Barcha talabalarni olish
 */
export const getAdminStudents = async (
  page?: number,
  pageSize?: number
): Promise<User[]> => {
  const params: Record<string, unknown> = {}
  if (page !== undefined) params.page = page
  if (pageSize !== undefined) params.page_size = pageSize
  const data = await apiClient.get<User[]>('/api/auth/user-list/', { params })
  return (data || []).filter((u) => u.role === 'student')
}

/**
 * Talabani tahrirlash
 */
export const updateAdminStudent = async (
  id: number | string,
  data: Partial<AdminStudentCreatePayload>
): Promise<User> => {
  const numericId = assertStudentId(id)
  const payload: Record<string, unknown> = {}
  if (data.full_name) payload.full_name = data.full_name.trim()
  if (data.phone) {
    const phone = data.phone.trim().replace(/\s/g, '')
    const digits = phone.replace(/\+998/, '').replace(/^998/, '')
    if (digits.length === 9 && /^\d{9}$/.test(digits)) {
      payload.phone = digits
    }
  }
  return await apiClient.put<User>(`/api/auth/users/${numericId}/`, payload)
}

/**
 * Talabani o'chirish
 */
export const deleteAdminStudent = async (
  id: number | string
): Promise<void> => {
  const numericId = assertStudentId(id)
  await apiClient.delete(`/api/auth/profile-delete/${numericId}/`)
}
