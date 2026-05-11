import { apiClient } from '@/api/client'
import type { User, UserListResponse } from '@/api/service/teacher/user.type'
import { AUTH } from '@/constants/apiEndPoints'

/** GET /api/auth/user-list/ ba'zan [] yoki { users: [] } qaytaradi — sxema har doim to'g'ri emas */
function normalizeUserListResponse(raw: unknown): UserListResponse {
  if (Array.isArray(raw)) {
    return {
      count: raw.length,
      next: null,
      previous: null,
      results: raw as User[],
    }
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.results)) {
      const list = o.results as User[]
      return {
        count: typeof o.count === 'number' ? o.count : list.length,
        next: (o.next as string | null) ?? null,
        previous: (o.previous as string | null) ?? null,
        results: list,
      }
    }
    if (Array.isArray(o.users)) {
      const list = o.users as User[]
      return { count: list.length, next: null, previous: null, results: list }
    }
    if (Array.isArray(o.data)) {
      const list = o.data as User[]
      return { count: list.length, next: null, previous: null, results: list }
    }
  }
  return { count: 0, next: null, previous: null, results: [] }
}

export const getAdminStudents = (): Promise<UserListResponse> => {
  return apiClient.get<unknown>(AUTH.USER_LIST).then(normalizeUserListResponse)
}

export const searchAdminStudents = (q: string): Promise<UserListResponse> => {
  const search = q.trim()
  return apiClient
    .get<unknown>(AUTH.USER_LIST, {
      params: search ? { search } : undefined,
    })
    .then(normalizeUserListResponse)
}

export type AdminStudentCreatePayload = {
  username: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  password?: string
  role: 'student'
}

/** +998 dan keyin 9 ta raqam (masalan 901234567) — API sxemasi maxLength 9 */
function extractNationalNine(phone?: string): string | undefined {
  if (!phone?.trim() || phone.trim() === '+998') return undefined
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('998')) digits = digits.slice(3)
  if (digits.length !== 9)
    throw new Error(
      "Telefon: +998 dan keyin aniq 9 ta raqam bo'lishi kerak (masalan: 90 123 45 67)"
    )
  return digits
}

function parseCreatedUserId(body: unknown): number | null {
  if (!body || typeof body !== 'object') return null
  const r = body as Record<string, unknown>
  const rawId = r.id ?? (r.user && typeof r.user === 'object'
    ? (r.user as Record<string, unknown>).id
    : undefined)
  if (typeof rawId === 'number' && Number.isFinite(rawId)) return rawId
  if (typeof rawId === 'string' && /^\d+$/.test(rawId)) return Number(rawId)
  return null
}

export const createAdminStudent = async (
  data: AdminStudentCreatePayload
): Promise<User> => {
  if (!data.username?.trim()) throw new Error('Username kiritilmadi')
  if (!data.email?.trim()) throw new Error('Email kiritilmadi')
  if (!data.first_name?.trim()) throw new Error('Ism kiritilmadi')
  if (!data.last_name?.trim()) throw new Error('Familiya kiritilmadi')
  if (!data.password?.trim()) throw new Error('Parol kiritilmadi')

  const password = data.password.trim()
  if (password.length < 8)
    throw new Error("Parol kamida 8 belgi bo'lishi kerak")

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email.trim()))
    throw new Error("Email formati noto'g'ri")

  const nine = data.phone ? extractNationalNine(data.phone) : undefined

  const registerPayload: Record<string, unknown> = {
    username: data.username.trim(),
    email: data.email.trim(),
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
    password,
    password2: password,
    role: 'student',
  }
  /** Sxema: telefon 9 ta milliy raqam (masalan 901234567) */
  if (nine) registerPayload.phone = nine

  const created = await apiClient.post<unknown>(
    '/api/auth/register/',
    registerPayload
  )

  const newId = parseCreatedUserId(created)
  if (newId != null) {
    try {
      await apiClient.patch<User>(`/api/auth/users/${newId}/`, {
        email: data.email.trim(),
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
      })
    } catch {
      /* POST da profil maydonlari bo'lsa yetarli bo'lishi mumkin */
    }
  }

  return created as User
}

export type AdminStudentUpdatePayload = Partial<
  Omit<AdminStudentCreatePayload, 'password' | 'role'>
>

export const updateAdminStudent = (
  studentId: number,
  data: AdminStudentUpdatePayload
): Promise<User> => {
  return apiClient.patch<User>(`/api/auth/users/${studentId}/`, data)
}

export const deleteAdminStudent = (studentId: number): Promise<unknown> => {
  return apiClient.delete<unknown>(`/api/auth/users/${studentId}/`)
}
