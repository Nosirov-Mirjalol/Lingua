import { useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { NOTIFICATIONS } from '@/constants/apiEndPoints'

export interface StudentNotificationAPI {
  id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
}
export const useStudentNotificationsList = (
  options: { enabled?: boolean } = {}
) => {
  const { enabled = true } = options
  return useQuery({
    queryKey: ['student', 'notifications'],
    queryFn: () =>
      apiClient.get<StudentNotificationAPI[]>(NOTIFICATIONS.MY),
    enabled,
    staleTime: 10_000, // 10 soniya
    refetchInterval: 30_000, // 30 soniya (fallback)
    refetchOnWindowFocus: true,
  })
}

/** O'qilmagan xabarlar sonini olish */
export const useStudentUnreadCount = (
  options: { enabled?: boolean } = {}
) => {
  const { enabled = true } = options
  return useQuery({
    queryKey: ['student', 'notifications', 'unread-count'],
    queryFn: () =>
      apiClient.get<{ unread_count: number }>(NOTIFICATIONS.UNREAD_COUNT),
    enabled,
    staleTime: 30_000, // 30 soniya
    refetchInterval: 30_000, // 30 soniya
    refetchOnWindowFocus: true,
  })
}

/** Bitta bildirishnomani o'qilgan deb belgilash */
export const useStudentMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      apiClient.patch<{ detail: string }>(NOTIFICATIONS.MARK_READ(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] })
      await queryClient.invalidateQueries({ queryKey: ['student', 'notifications', 'unread-count'] })
    },
  })
}

/** Barcha bildirishnomalarni o'qilgan deb belgilash */
export const useStudentMarkAllRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiClient.post<{ updated: number }>(NOTIFICATIONS.MARK_ALL_READ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] })
      await queryClient.invalidateQueries({ queryKey: ['student', 'notifications', 'unread-count'] })
    },
  })
}

export const useStudentDeleteNotifications = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) =>
      Promise.all(
        ids.map((id) =>
          apiClient.delete<void>(NOTIFICATIONS.DELETE(id))
        )
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] })
      await queryClient.invalidateQueries({ queryKey: ['student', 'notifications', 'unread-count'] })
    },
  })
}

// ─── WebSocket Hook ───────────────────────────────────────────────────────────

function getWsBaseUrl(): string {
  const httpBase = import.meta.env.VITE_API_BASE_URL || ''

  if (
    httpBase &&
    (httpBase.startsWith('http://') || httpBase.startsWith('https://'))
  ) {
    return httpBase
      .replace(/\/+$/, '')
      .replace(/^http:/, 'ws:')
      .replace(/^https:/, 'wss:')
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}`
}

function getAccessToken(): string {
  if (typeof window === 'undefined') return ''
  
  // 1. Check session storage (set by useLogin hook)
  const sessionToken = sessionStorage.getItem('linguapro_access_token')
  if (sessionToken) return sessionToken

  // 2. Check local storage (fallback)
  const localToken = localStorage.getItem('access_token')
  if (localToken) return localToken

  // 3. Check cookies (matching auth-store.ts)
  const ACCESS_TOKEN_KEY = 'thisisjustarandomstring'
  const cookieValue = `; ${document.cookie}`
  const parts = cookieValue.split(`; ${ACCESS_TOKEN_KEY}=`)
  if (parts.length === 2) {
    try {
      const token = parts.pop()?.split(';').shift()
      return token ? JSON.parse(token) : ''
    } catch {
      return ''
    }
  }

  return ''
}

/**
 * WebSocket orqali real-time notification olish.
 * Yangi xabar kelganda query cache invalidate qilinadi.
 */
export const useNotificationWebSocket = (
  options: { enabled?: boolean } = {}
) => {
  const { enabled = true } = options
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptRef = useRef(0)
  const isConnectingRef = useRef(false)
  const MAX_RECONNECT_ATTEMPTS = 5

  const invalidateNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] })
    queryClient.invalidateQueries({
      queryKey: ['student', 'notifications', 'unread-count'],
    })
  }, [queryClient])

  const connect = useCallback(() => {
    if (isConnectingRef.current) return
    
    // Agar allaqachon ulanayotgan bo'lsa yoki ulanib bo'lgan bo'lsa, tegmaymiz
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      return
    }

    const token = getAccessToken()
    if (!token) return

    const wsBase = getWsBaseUrl()
    const wsUrl = `${wsBase}/ws/notifications/?token=${token}`

    try {
      isConnectingRef.current = true
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        isConnectingRef.current = false
        reconnectAttemptRef.current = 0
      }

      ws.onmessage = (event) => {
        invalidateNotifications()
        try {
          JSON.parse(event.data)
        } catch {
          // JSON emas
        }
      }

      ws.onclose = (event) => {
        isConnectingRef.current = false
        wsRef.current = null

        // Auth xatosi bo'lsa qayta ulanmaymiz
        if (event.code >= 4000) return

        // Xatolik bo'lsa spam qilmaslik uchun juda uzoq vaqt kutamiz (masalan 30-60 sekund)
        if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            30_000 * Math.pow(2, reconnectAttemptRef.current),
            300_000 // Max 5 daqiqa
          )
          reconnectAttemptRef.current += 1
          reconnectTimerRef.current = setTimeout(connect, delay)
        }
      }

      ws.onerror = () => {
        isConnectingRef.current = false
      }

      wsRef.current = ws
    } catch {
      isConnectingRef.current = false
    }
  }, [invalidateNotifications])

  useEffect(() => {
    if (!enabled) return

    connect()

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
      }
    }
  }, [connect, enabled])
}
