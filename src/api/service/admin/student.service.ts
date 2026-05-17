import { apiClient, type ApiError } from '@/api/client'
import type { User, UserListResponse } from '@/api/service/teacher/user.type'
import { AUTH } from '@/constants/apiEndPoints'

/** GET /api/auth/user-list/ ba'zan [] yoki { users: [] } qaytaradi */
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

export const searchAdminStudents = (
  q: string,
  page = 1,
  pageSize = 10
): Promise<UserListResponse> => {
  const search = q.trim()
  return apiClient
    .get<unknown>(AUTH.USER_LIST, {
      params: {
        ...(search ? { search } : {}),
        page,
        page_size: pageSize,
      },
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

export type AdminStudentUpdatePayload = {
  username?: string
  first_name: string
  last_name: string
  phone?: string
  is_active?: boolean
}

/** +998 dan keyin 9 ta raqam */
export function extractNationalNine(phone?: string): string | undefined {
  if (!phone?.trim() || phone.trim() === '+998') return undefined
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('998')) digits = digits.slice(3)
  if (digits.length !== 9)
    throw new Error(
      "Telefon: +998 dan keyin aniq 9 ta raqam bo'lishi kerak (masalan: 90 123 45 67)"
    )
  return digits
}

/** API dan kelgan 9 raqamni ko'rinish formatiga */
export function formatPhoneDisplay(phone?: string | null): string {
  if (!phone?.trim()) return '+998'
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('998')) digits = digits.slice(3)
  if (digits.length === 0) return '+998'
  const d = digits.slice(0, 9)
  let formatted = '+998'
  if (d.length > 0) formatted += ' ' + d.slice(0, 2)
  if (d.length > 2) formatted += ' ' + d.slice(2, 5)
  if (d.length > 5) formatted += ' ' + d.slice(5, 7)
  if (d.length > 7) formatted += ' ' + d.slice(7, 9)
  return formatted
}

function buildFullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, ' ').trim()
}

export function getStudentApiErrorMessage(
  error: unknown,
  fallback = 'Xatolik yuz berdi'
): string {
  if (error instanceof Error && error.message) return error.message
  const api = error as ApiError
  if (api?.message) return String(api.message)
  return fallback
}

function assertStudentId(studentId: number): void {
  if (!Number.isFinite(studentId) || studentId <= 0) {
    throw new Error('Student ID noto\'g\'ri')
  }
}

/**
 * Admin talaba yaratish — POST /api/auth/register/
 */
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
  const firstName = data.first_name.trim()
  const lastName = data.last_name.trim()
  const fullName = buildFullName(firstName, lastName)

  const registerPayload: Record<string, unknown> = {
    username: data.username.trim(),
    email: data.email.trim(),
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    password,
    password2: password,
    role: 'student',
  }
  if (nine) registerPayload.phone = nine

  try {
    const created = await apiClient.post<unknown>(
      '/api/auth/register/',
      registerPayload
    )
    return created as User
  } catch (error) {
    const status = (error as ApiError)?.status
    if (status === 401) {
      throw new Error(
        "Sessiya tugagan yoki ruxsat yo'q. Qayta tizimga kiring (admin hisobi bilan)."
      )
    }
    throw new Error(getStudentApiErrorMessage(error, 'Student yaratishda xatolik'))
  }
}

/**
 * Admin talabani yangilash — PATCH /api/auth/my-profile-update/
 * (admin: body da `id` orqali boshqa userni yangilash)
 */
export const updateAdminStudent = async (
  studentId: number,
  data: AdminStudentUpdatePayload
): Promise<User> => {
  assertStudentId(studentId)

  const firstName = data.first_name?.trim()
  const lastName = data.last_name?.trim()
  if (!firstName) throw new Error('Ism kiritilmadi')
  if (!lastName) throw new Error('Familiya kiritilmadi')

  const fullName = buildFullName(firstName, lastName)
  const payload: Record<string, unknown> = {
    id: studentId,
    full_name: fullName,
    first_name: firstName,
    last_name: lastName,
  }

  if (data.username?.trim()) payload.username = data.username.trim()

  if (data.phone !== undefined) {
    if (!data.phone.trim() || data.phone.trim() === '+998') {
      payload.phone = null
    } else {
      payload.phone = extractNationalNine(data.phone)
    }
  }

  if (data.is_active !== undefined) payload.is_active = data.is_active

  try {
    return await apiClient.patch<User>(AUTH.PROFILE_UPDATE, payload)
  } catch (error) {
    const status = (error as ApiError)?.status
    if (status === 401) {
      throw new Error(
        "Sessiya tugagan yoki ruxsat yo'q. Qayta tizimga kiring."
      )
    }
    throw new Error(
      getStudentApiErrorMessage(error, 'Student yangilashda xatolik')
    )
  }
}

/**
 * Admin talabani o'chirish — DELETE /api/auth/profile-delete/{id}/
 */
export const deleteAdminStudent = async (studentId: number): Promise<void> => {
  assertStudentId(studentId)

  try {
    await apiClient.delete<unknown>(AUTH.PROFILE_DELETE(studentId))
  } catch (error) {
    const status = (error as ApiError)?.status
    if (status === 401) {
      throw new Error(
        "Sessiya tugagan yoki ruxsat yo'q. Qayta tizimga kiring."
      )
    }
    if (status === 404) {
      throw new Error('Student topilmadi')
    }
    throw new Error(
      getStudentApiErrorMessage(error, "Student o'chirishda xatolik")
    )
  }
}
