/**
 * Dev: bo'sh base URL → Vite proxy orqali /api (CORS yo'q).
 * Production: VITE_API_BASE_URL to'liq manzil.
 */
export function getApiBaseUrl(): string {
  const env = (import.meta.env.VITE_API_BASE_URL || '').trim()
  if (import.meta.env.DEV) return ''
  return env
}

/** Media (avatar, kurs rasmi) uchun asosiy URL */
export function getMediaBaseUrl(): string {
  const env = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin
  }
  return env
}
