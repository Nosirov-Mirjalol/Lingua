import { normalizePhoneForApi } from '@/lib/phone'

export type AuthUserHint = {
  username: string
  phone: string
}

const HINT_KEY = 'linguapro_forgot_hint'

export function saveAuthUserHint(user: {
  username?: string
  phone?: string | null
}): void {
  const username = user.username?.trim()
  if (!username) return

  const phone = user.phone ? normalizePhoneForApi(user.phone) : ''
  const hint: AuthUserHint = { username, phone }
  try {
    localStorage.setItem(HINT_KEY, JSON.stringify(hint))
  } catch {
    /* ignore quota */
  }
}

export function readAuthUserHint(): AuthUserHint | null {
  try {
    const raw =
      localStorage.getItem(HINT_KEY) ??
      localStorage.getItem('user') ??
      sessionStorage.getItem('linguapro_user')
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<AuthUserHint> & {
      username?: string
      phone?: string | null
    }
    const username = parsed.username?.trim()
    if (!username) return null

    const phone = parsed.phone ? normalizePhoneForApi(String(parsed.phone)) : ''
    return { username, phone }
  } catch {
    return null
  }
}
