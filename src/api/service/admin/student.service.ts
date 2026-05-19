import { apiClient } from '@/api/client'
import type { User, ApiError } from '@/types/student'

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
    throw new Error("Student ID noto'g'ri")
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
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
      })
    } catch {
      // Ignored for now
    }
  }

  return created as User
}

/**
 * Barcha talabalarni olish
 */
export const getAdminStudents = async (): Promise<User[]> => {
  const data = await apiClient.get<User[]>('/api/auth/users/')
  return (data || []).filter((u) => u.role === 'student')
}

/**
 * Talabani tahrirlash
 */
export const updateAdminStudent = async (
  id: number,
  data: Partial<AdminStudentCreatePayload>
): Promise<User> => {
  assertStudentId(id)
  const payload: Record<string, unknown> = {}
  if (data.first_name) payload.first_name = data.first_name.trim()
  if (data.last_name) payload.last_name = data.last_name.trim()
  if (data.email) payload.email = data.email.trim()
  if (data.phone) {
    const nine = extractNationalNine(data.phone)
    if (nine) payload.phone = nine
  }
  return await apiClient.patch<User>(`/api/auth/users/${id}/`, payload)
}

/**
 * Talabani o'chirish
 */
export const deleteAdminStudent = async (id: number): Promise<void> => {
  assertStudentId(id)
  await apiClient.delete(`/api/auth/users/${id}/`)
}
