import { getMediaBaseUrl } from '@/lib/api-base-url'

/**
 * Avatar URL ni normallashtirish (nisbiy yo'l → to'liq URL).
 */
export function getFullAvatarUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null
  if (url.trim().toLowerCase() === 'string') return null

  if (/^(https?|blob):/i.test(url)) {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      try {
        const parsed = new URL(url)
        if (parsed.pathname.startsWith('/media')) {
          return `${window.location.origin}${parsed.pathname}${parsed.search}`
        }
      } catch {
        /* ignore */
      }
    }
    return url
  }

  const baseUrl = getMediaBaseUrl()
  const cleanPath = url.startsWith('/') ? url : `/${url}`

  return `${baseUrl}${cleanPath}`
}
