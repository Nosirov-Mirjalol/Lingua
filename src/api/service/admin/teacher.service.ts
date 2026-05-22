import { apiClient } from '@/api/client'
import { GROUP } from '@/constants/apiEndPoints'

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
  full_name: string
  phone?: string
  learning_goal?: string
  password: string
  avatar?: File
  role?: 'teacher'
}

export type AdminTeacherUpdatePayload = Partial<
  Pick<
    AdminTeacher,
    'username' | 'full_name' | 'phone' | 'learning_goal' | 'avatar'
  >
>

function normalizeTeacherList(data: unknown): AdminTeacher[] {
  if (Array.isArray(data)) return data as AdminTeacher[]
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    const list =
      record.results ?? record.data ?? record.teachers ?? record.user_list
    if (Array.isArray(list)) return list as AdminTeacher[]
  }
  return []
}

export const getAdminTeachers = async (): Promise<AdminTeacher[]> => {
  const data = await apiClient.get<unknown>(GROUP.TEACHER_LIST)
  return normalizeTeacherList(data)
}

export const createAdminTeacher = (
  data: AdminTeacherCreatePayload
): Promise<AdminTeacher> => {
  // Validation
  if (!data.username?.trim()) throw new Error('Username kiritilmadi')
  if (!data.full_name?.trim()) throw new Error("To'liq ism kiritilmadi")
  if (!data.password?.trim()) throw new Error('Parol kiritilmadi')

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
  const password = data.password.trim()

  // If avatar file is provided, use FormData
  if (data.avatar) {
    const formData = new FormData()
    formData.append('username', data.username.trim())
    formData.append('full_name', fullName)
    if (formattedPhone) formData.append('phone', formattedPhone)
    if (data.learning_goal?.trim())
      formData.append('learning_goal', data.learning_goal.trim())
    formData.append('password', password)
    formData.append('password2', password)
    formData.append('role', 'teacher')
    formData.append('avatar', data.avatar)

    return apiClient.post<AdminTeacher>('/api/auth/register/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  // Otherwise, use JSON payload
  const payload = {
    username: data.username.trim(),
    full_name: fullName,
    phone: formattedPhone,
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
    const phone = data.phone.trim().replace(/\s/g, '')
    const digits = phone.replace(/\+998/, '').replace(/^998/, '')
    if (digits.length === 9 && /^\d{9}$/.test(digits)) {
      updatePayload.phone = digits
    }
  }
  if (data.learning_goal !== undefined) {
    updatePayload.learning_goal = data.learning_goal.trim()
  }
  if (data.avatar !== undefined) {
    updatePayload.avatar = data.avatar.trim()
  }

  return apiClient.put<AdminTeacher>(
    `/api/auth/users/${teacherId}/`,
    updatePayload
  )
}

export const deleteAdminTeacher = (teacherId: number): Promise<unknown> => {
  return apiClient.delete<unknown>(`/api/auth/profile-delete/${teacherId}/`)
}
