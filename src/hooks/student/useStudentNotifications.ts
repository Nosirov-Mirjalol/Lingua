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

export const useStudentNotificationsList = () => {
  return useQuery({
    queryKey: ['student', 'notifications'],
    queryFn: () => apiClient.get<StudentNotificationAPI[]>(NOTIFICATIONS.MY),
    staleTime: 2_000,
    refetchInterval: 2_000,
  })
}

export const useStudentUnreadCount = () => {
  return useQuery({
    queryKey: ['student', 'notifications', 'unread-count'],
    queryFn: () => apiClient.get<{ unread_count: number }>(NOTIFICATIONS.UNREAD_COUNT),
    refetchInterval: 2_000,
  })
}

export const useStudentMarkAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.patch<{ detail: string }>(NOTIFICATIONS.MARK_READ(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] })
      await queryClient.invalidateQueries({ queryKey: ['student', 'notifications', 'unread-count'] })
    },
  })
}

export const useStudentMarkAllRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.post<{ updated: number }>(NOTIFICATIONS.MARK_ALL_READ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] })
      await queryClient.invalidateQueries({ queryKey: ['student', 'notifications', 'unread-count'] })
    },
  })
}

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

    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.close()
    }

    const wsBase = getWsBaseUrl()
    const wsUrl = `${wsBase}/ws/notifications/?token=${token}`

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        reconnectAttemptRef.current = 0
      }

      ws.onmessage = () => {
        invalidateNotifications()
      }

      ws.onclose = () => {
        wsRef.current = null
        if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptRef.current),
            30_000
          )
          reconnectAttemptRef.current += 1
          reconnectTimerRef.current = setTimeout(connect, delay)
        }
      }

      ws.onerror = () => {}
      wsRef.current = ws
    } catch {}
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
