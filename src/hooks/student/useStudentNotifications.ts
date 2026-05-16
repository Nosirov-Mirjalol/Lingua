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

type NotificationQueryOptions = {
  enabled?: boolean
}

type StudentUnreadCountOptions = NotificationQueryOptions & {
  refetchInterval?: number | false
}

type NotificationSocketOptions = {
  enabled?: boolean
}

type NotificationSocketPayload = {
  action?: string
  event?: string
  id?: number
  is_read?: boolean
  message?: string
  notification?: unknown
  type?: string
  unread_count?: number
}

function shouldInvalidateNotifications(data: unknown): boolean {
  if (typeof data !== 'string') return false

  const raw = data.trim()
  if (!raw) return false

  const normalized = raw.toLowerCase()
  if (['ping', 'pong', 'heartbeat', 'keepalive'].includes(normalized)) {
    return false
  }

  try {
    const payload = JSON.parse(raw) as NotificationSocketPayload
    const markers = [payload.type, payload.event, payload.action]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
    const stringValues = Object.values(payload)
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.toLowerCase())

    if (
      [...markers, ...stringValues].some((marker) =>
        ['ping', 'pong', 'heartbeat', 'keepalive'].includes(marker)
      )
    ) {
      return false
    }

    if (typeof payload.unread_count === 'number') return true
    if ('notification' in payload || 'is_read' in payload || 'id' in payload) {
      return true
    }

    return markers.some(
      (marker) =>
        marker.includes('notification') ||
        marker.includes('unread') ||
        marker === 'mark_read' ||
        marker === 'read_all'
    ) || stringValues.some(
      (value) =>
        value.includes('notification') ||
        value.includes('unread_count') ||
        value === 'mark_read' ||
        value === 'read_all'
    )
  } catch {
    return (
      normalized.includes('notification') || normalized.includes('unread_count')
    )
  }
}

export const useStudentNotificationsList = (
  { enabled = true }: NotificationQueryOptions = {}
) => {
  return useQuery({
    queryKey: ['student', 'notifications'],
    queryFn: () => apiClient.get<StudentNotificationAPI[]>(NOTIFICATIONS.MY),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}

export const useStudentUnreadCount = (
  { enabled = true, refetchInterval = false }: StudentUnreadCountOptions = {}
) => {
  return useQuery({
    queryKey: ['student', 'notifications', 'unread-count'],
    enabled,
    queryFn: () => apiClient.get<{ unread_count: number }>(NOTIFICATIONS.UNREAD_COUNT),
    staleTime: 30_000,
    refetchInterval,
    refetchOnWindowFocus: false,
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

export const useNotificationWebSocket = (
  { enabled = true }: NotificationSocketOptions = {}
) => {
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
    if (!enabled) return

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

      ws.onmessage = (event) => {
        if (shouldInvalidateNotifications(event.data)) {
          invalidateNotifications()
        }
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
  }, [enabled, invalidateNotifications])

  useEffect(() => {
    if (!enabled) return

    connect()
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
      }
    }
  }, [connect, enabled])
}
