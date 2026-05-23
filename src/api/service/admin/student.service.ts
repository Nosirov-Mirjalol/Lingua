import { apiClient } from '@/api/client'
import type { User, UserListResponse } from '@/api/service/teacher/user.type'

export type AdminStudentCreatePayload = {
  username: string
  full_name: string
  phone?: string
  password?: string
  role: 'student'
}

export type AdminStudentUpdatePayload = {
  username?: string
  full_name?: string
  phone?: string
  is_active?: boolean
}

export type AdminStudentListResult = {
  students: User[]
  totalCount: number
}

export function _parseCreatedUserId(body: unknown): number | null {
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

function filterStudents(users: User[]): User[] {
  return users.filter((u) => {
    const role = u.role != null ? String(u.role).toLowerCase() : ''
    return !role || role === 'student'
  })
}

function matchesSearch(student: User, search: string): boolean {
  const q = search.trim().toLowerCase()
  if (!q) return true
  return (
    (student.full_name ?? '').toLowerCase().includes(q) ||
    (student.username ?? '').toLowerCase().includes(q) ||
    (student.phone ?? '').toLowerCase().includes(q)
  )
}

function formatPhoneDigits(phone?: string): string | undefined {
  if (!phone?.trim()) return undefined
  const normalized = phone.trim().replace(/\s/g, '')
  const digits = normalized.replace(/\+998/, '').replace(/^998/, '')
  if (digits.length !== 9 || !/^\d{9}$/.test(digits)) {
    throw new Error(
      "Telefon raqami noto'g'ri formatda. Masalan: +998901234567 yoki 901234567"
    )
  }
  return digits
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

  const formattedPhone = formatPhoneDigits(data.phone)
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
 * Talabalar ro'yxati (server pagination + qidiruv)
 */
export const getAdminStudents = async (
  page = 1,
  pageSize = 10,
  search = ''
): Promise<AdminStudentListResult> => {
  const params: Record<string, unknown> = {
    page,
    page_size: pageSize,
  }
  const q = search.trim()
  if (q) params.search = q

  const raw = await apiClient.get<unknown>('/api/auth/user-list/', { params })

  if (Array.isArray(raw)) {
    let list = filterStudents(raw)
    if (q) list = list.filter((s) => matchesSearch(s, q))
    const totalCount = list.length
    const start = (page - 1) * pageSize
    return {
      students: list.slice(start, start + pageSize),
      totalCount,
    }
  }

  if (raw && typeof raw === 'object' && 'results' in raw) {
    const res = raw as UserListResponse
    let list = filterStudents(res.results ?? [])
    const serverCount = res.count ?? list.length
    if (q) {
      list = list.filter((s) => matchesSearch(s, q))
    }
    return {
      students: list,
      totalCount: q ? list.length : serverCount,
    }
  }

  return { students: [], totalCount: 0 }
}

/**
 * Talabani tahrirlash
 */
export const updateAdminStudent = async (
  id: number | string,
  data: AdminStudentUpdatePayload
): Promise<User> => {
  const numericId = assertStudentId(id)
  const payload: Record<string, unknown> = {}

  if (data.username !== undefined) {
    const username = data.username.trim()
    if (!username) throw new Error('Username kiritilmadi')
    payload.username = username
  }

  if (data.full_name !== undefined) {
    const fullName = data.full_name.trim()
    if (!fullName) throw new Error("To'liq ism kiritilmadi")
    payload.full_name = fullName
  }

  if (data.phone !== undefined) {
    const trimmed = data.phone.trim()
    if (!trimmed || trimmed === '+998') {
      payload.phone = null
    } else {
      payload.phone = formatPhoneDigits(trimmed)
    }
  }

  if (data.is_active !== undefined) {
    payload.is_active = data.is_active
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
