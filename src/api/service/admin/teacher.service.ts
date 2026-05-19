import { apiClient } from '@/api/client'
import { AUTH, GROUP } from '@/constants/apiEndPoints'

export interface AdminTeacher {
  id: number
  username: string
  full_name: string
  phone: string
  avatar: string
  learning_goal: string
}

export type AdminTeacherCreatePayload = {
  username: string
  email: string
  full_name: string
  phone?: string
  learning_goal?: string
  password: string
  role?: 'teacher'
}

export type AdminTeacherUpdatePayload = Partial<
  Pick<AdminTeacher, 'username' | 'full_name' | 'phone' | 'learning_goal' | 'avatar'>
>

export const getAdminTeachers = (): Promise<AdminTeacher[]> => {
  return apiClient.get<AdminTeacher[]>(GROUP.TEACHER_LIST)
}

export const createAdminTeacher = (
  data: AdminTeacherCreatePayload
): Promise<AdminTeacher> => {
  // Validation
  if (!data.username?.trim()) throw new Error('Username kiritilmadi')
  if (!data.email?.trim()) throw new Error('Email kiritilmadi')
  if (!data.full_name?.trim()) throw new Error("To'liq ism kiritilmadi")
  if (!data.password?.trim()) throw new Error('Parol kiritilmadi')

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email.trim())) {
    throw new Error("Email formati noto'g'ri")
  }

  const fullName = data.full_name.trim().replace(/\s+/g, ' ')
  const password = data.password.trim()
  const payload = {
    username: data.username.trim(),
    email: data.email.trim(),
    full_name: fullName,
    phone: data.phone?.trim() || undefined,
    learning_goal: data.learning_goal?.trim() || undefined,
    password,
    password2: password,
    role: 'teacher' as const,
  }

  return apiClient.post<AdminTeacher>('/api/auth/register/', payload)
}

export const updateAdminTeacher = (
  teacherId: number,
  data: AdminTeacherUpdatePayload
): Promise<AdminTeacher> => {
  const updatePayload: Record<string, unknown> = {}

  if (data.username !== undefined) {
    updatePayload.username = data.username.trim()
  }
  if (data.full_name !== undefined) {
    updatePayload.full_name = data.full_name.trim()
  }
  if (data.phone !== undefined) {
    updatePayload.phone = data.phone.trim()
  }
  if (data.learning_goal !== undefined) {
    updatePayload.learning_goal = data.learning_goal.trim()
  }
  if (data.avatar !== undefined) {
    updatePayload.avatar = data.avatar.trim()
  }
  updatePayload.id = teacherId

  return apiClient.patch<AdminTeacher>(AUTH.PROFILE_UPDATE, updatePayload)
}

export const deleteAdminTeacher = (teacherId: number): Promise<unknown> => {
  return apiClient.delete<unknown>(AUTH.PROFILE_DELETE(teacherId))
}
