import { useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { NOTIFICATIONS } from '@/constants/apiEndPoints'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentNotificationAPI {
  id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
}

// ─── REST Hooks ───────────────────────────────────────────────────────────────

/** Barcha bildirishnomalarni olish */
export const useStudentNotificationsList = () => {
  return useQuery({
    queryKey: ['student', 'notifications'],
    queryFn: () =>
      apiClient.get<StudentNotificationAPI[]>(NOTIFICATIONS.MY),
    staleTime: 2_000,
    refetchInterval: 2_000, // 2 soniya - ultra tezkor polling
  })
}

/** O'qilmagan xabarlar sonini olish */
export const useStudentUnreadCount = () => {
  return useQuery({
    queryKey: ['student', 'notifications', 'unread-count'],
    queryFn: () =>
      apiClient.get<{ unread_count: number }>(NOTIFICATIONS.UNREAD_COUNT),
    refetchInterval: 2_000, // Dashboard ham 2 soniyada yangilanadi
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

// ─── WebSocket Hook ───────────────────────────────────────────────────────────

function getWsBaseUrl(): string {
  const httpBase = import.meta.env.VITE_API_BASE_URL || ''
  if (httpBase) {
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
  return (
    sessionStorage.getItem('linguapro_access_token') ||
    localStorage.getItem('access_token') ||
    ''
  )
}

/**
 * WebSocket orqali real-time notification olish.
 * Yangi xabar kelganda query cache invalidate qilinadi.
 */
export const useNotificationWebSocket = () => {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptRef = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 10

  const invalidateNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] })
    queryClient.invalidateQueries({ queryKey: ['student', 'notifications', 'unread-count'] })
  }, [queryClient])

  const connect = useCallback(() => {
    const token = getAccessToken()
    if (!token) return

    // Oldingi ulanishni yopish
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.close()
    }

    const wsBase = getWsBaseUrl()
    // Ba'zi serverlarda /ws/ siz, ba'zilarida /ws/ bilan ishlaydi. 
    // Ikkala holatni ham tekshirib ko'rish uchun path'ni o'zgartirdik.
    const wsUrl = `${wsBase}/ws/notifications/?token=${token}`

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        reconnectAttemptRef.current = 0
      }

      ws.onmessage = (event) => {
        // Har qanday xabar kelganda ma'lumotlarni yangilaymiz (xavfsizlik uchun)
        invalidateNotifications()

        try {
          const data = JSON.parse(event.data)
          console.log('WS Notification received:', data)
        } catch {
          // JSON bo'lmasa ham invalidateNotifications() tepadagi qatorda chaqirildi
        }
      }

      ws.onclose = (event) => {
        wsRef.current = null

        // Serverdan 4000+ code bilan yopilsa qayta ulanmaymiz (auth xato)
        if (event.code >= 4000) return

        // Exponential backoff bilan qayta ulanish
        if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptRef.current),
            30_000
          )
          reconnectAttemptRef.current += 1
          reconnectTimerRef.current = setTimeout(connect, delay)
        }
      }

      ws.onerror = () => {
        // onerror dan keyin onclose avtomatik chaqiriladi
      }

      wsRef.current = ws
    } catch {
      // WebSocket yaratishda xatolik (invalid URL, etc.)
    }
  }, [invalidateNotifications])

  useEffect(() => {
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
  }, [connect])
}
