/**
 * Avatar URL ni normallashtirish (nisbiy yo'l → to'liq URL).
 */
export function getFullAvatarUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null
  if (url.trim().toLowerCase() === 'string') return null

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
  const cleanPath = url.startsWith('/') ? url : `/${url}`

  return `${baseUrl}${cleanPath}`
}
