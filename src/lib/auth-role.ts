export type AppUserRole = 'admin' | 'teacher' | 'student' | 'user'

function cleanRoleValue(role: string) {
  return role.trim().toLowerCase().replace(/[\s-]+/g, '_')
}

export function normalizeUserRole(role: unknown): AppUserRole | null {
  if (typeof role !== 'string') return null

  const value = cleanRoleValue(role)

  if (
    value === 'admin' ||
    value === 'superadmin' ||
    value === 'super_admin' ||
    value === 'role_admin' ||
    value === 'role_superadmin' ||
    value === 'role_super_admin' ||
    value.includes('admin')
  ) {
    return 'admin'
  }

  if (value === 'teacher' || value === 'role_teacher' || value.includes('teacher')) {
    return 'teacher'
  }

  if (
    value === 'student' ||
    value === 'role_student' ||
    value.includes('student')
  ) {
    return 'student'
  }

  if (value === 'user' || value === 'role_user') {
    return 'user'
  }

  return null
}

export function getDefaultRouteForRole(role: AppUserRole | null) {
  if (role === 'teacher') return '/teacher-dashboard'
  if (role === 'admin') return '/admin-dashboard'
  return '/student'
}

export function getSessionUserRole(): AppUserRole | null {
  if (typeof window === 'undefined') return null

  const raw = sessionStorage.getItem('linguapro_user')
  if (!raw) return null

  try {
    const user = JSON.parse(raw) as { role?: unknown }
    return normalizeUserRole(user.role)
  } catch {
    return null
  }
}
