import { apiClient } from '@/api/client'

export type AdminTeacher = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  is_active?: boolean
  created_at?: string
}

export type AdminTeacherCreatePayload = {
  username: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  password: string
  role?: 'teacher'
}

export type AdminTeacherUpdatePayload = Partial<
  Omit<AdminTeacherCreatePayload, 'password' | 'role'>
> & {
  is_active?: boolean
}

function normalizeTeacherListResponse(raw: unknown): AdminTeacher[] {
  if (Array.isArray(raw)) {
    return raw as AdminTeacher[]
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.results)) {
      return o.results as AdminTeacher[]
    }
    if (Array.isArray(o.users)) {
      return o.users as AdminTeacher[]
    }
    if (Array.isArray(o.data)) {
      return o.data as AdminTeacher[]
    }
  }
  return []
}

export const getAdminTeachers = (): Promise<AdminTeacher[]> => {
  return apiClient
    .get<unknown>('/api/auth/user-list/')
    .then((res) => {
      const list = normalizeTeacherListResponse(res)
      if (list.length > 0) return list
      return apiClient.get<unknown>('/api/teachers/').then(normalizeTeacherListResponse)
    })
    .then((list) => {
      if (list.length > 0) return list
      return apiClient.get<unknown>('/api/groups/teachers-list/').then(normalizeTeacherListResponse)
    })
    .catch(() =>
      apiClient
        .get<unknown>('/api/teachers/')
        .then(normalizeTeacherListResponse)
        .catch(() =>
          apiClient.get<unknown>('/api/groups/teachers-list/').then(normalizeTeacherListResponse)
        )
    )
}

export const createAdminTeacher = (
  data: AdminTeacherCreatePayload
): Promise<AdminTeacher> => {
  // Validation
  if (!data.username?.trim()) throw new Error('Username kiritilmadi')
  if (!data.email?.trim()) throw new Error('Email kiritilmadi')
  if (!data.first_name?.trim()) throw new Error('Ism kiritilmadi')
  if (!data.last_name?.trim()) throw new Error('Familiya kiritilmadi')
  if (!data.password?.trim()) throw new Error('Parol kiritilmadi')

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email.trim())) {
    throw new Error("Email formati noto'g'ri")
  }

  const payload = {
    username: data.username.trim(),
    email: data.email.trim(),
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
    phone: data.phone?.trim() || undefined,
    password: data.password.trim(),
    role: 'teacher' as const,
  }

  return apiClient.post<AdminTeacher>('/api/teachers/', payload)
}

export const updateAdminTeacher = (
  teacherId: number,
  data: AdminTeacherUpdatePayload
): Promise<AdminTeacher> => {
  const updatePayload: Record<string, unknown> = {}

  if (data.username !== undefined) {
    updatePayload.username = data.username.trim()
  }
  if (data.email !== undefined) {
    updatePayload.email = data.email.trim()
  }
  if (data.first_name !== undefined) {
    updatePayload.first_name = data.first_name.trim()
  }
  if (data.last_name !== undefined) {
    updatePayload.last_name = data.last_name.trim()
  }
  if (data.phone !== undefined) {
    updatePayload.phone = data.phone.trim()
  }
  if (data.is_active !== undefined) {
    updatePayload.is_active = data.is_active
  }

  return apiClient.patch<AdminTeacher>(`/api/teachers/${teacherId}/`, updatePayload)
}

export const deleteAdminTeacher = (teacherId: number): Promise<unknown> => {
  return apiClient.delete<unknown>(`/api/teachers/${teacherId}/`)
}
