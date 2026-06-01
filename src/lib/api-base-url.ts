
export function getApiBaseUrl(): string {
  const env = (import.meta.env.VITE_API_BASE_URL || '').trim()
  if (import.meta.env.DEV) return ''
  return env
}
export function getMediaBaseUrl(): string {
  const env = (import.meta.env._BASE_URL || '').trim().replace(/\/+$/, '')
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin
  }
  return env
}
