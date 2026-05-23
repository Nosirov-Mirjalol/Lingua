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

// ─── LIST ─────────────────────────────────────────────────────────────────────

export const useStudentNotificationsList = (
  options: { enabled?: boolean } = {}
) => {
  const { enabled = true } = options
  return useQuery({
    queryKey: ['student', 'notifications'],
    queryFn: () =>
      apiClient.get<StudentNotificationAPI[]>(NOTIFICATIONS.MY),
    enabled,
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

// ─── UNREAD COUNT ─────────────────────────────────────────────────────────────

export const useStudentUnreadCount = (
  options: { enabled?: boolean } = {}
) => {
  const { enabled = true } = options
  return useQuery({
    queryKey: ['student', 'notifications', 'unread-count'],
    queryFn: () =>
      apiClient.get<{ unread_count: number }>(NOTIFICATIONS.UNREAD_COUNT),
    enabled,
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

// ─── MARK AS READ (optimistic) ────────────────────────────────────────────────
// Bitta so'rov ketadi, UI darhol yangilanadi — qayta so'rov ketmaydi

export const useStudentMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      apiClient.patch<{ detail: string }>(NOTIFICATIONS.MARK_READ(id)),

    // API javobini kutmasdan UI ni darhol yangilaymiz
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['student', 'notifications'] })
      await queryClient.cancelQueries({ queryKey: ['student', 'notifications', 'unread-count'] })

      // Oldingi holatni saqlaymiz (rollback uchun)
      const prevList = queryClient.getQueryData<StudentNotificationAPI[]>(['student', 'notifications'])
      const prevCount = queryClient.getQueryData<{ unread_count: number }>(['student', 'notifications', 'unread-count'])

      // Optimistik yangilash — list
      queryClient.setQueryData<StudentNotificationAPI[]>(
        ['student', 'notifications'],
        (old) =>
          old?.map((n) => (n.id === id ? { ...n, is_read: true } : n)) ?? []
      )

      // Optimistik yangilash — unread count
      queryClient.setQueryData<{ unread_count: number }>(
        ['student', 'notifications', 'unread-count'],
        (old) => ({
          unread_count: Math.max(0, (old?.unread_count ?? 1) - 1),
        })
      )

      return { prevList, prevCount }
    },

    // Xato bo'lsa avvalgi holatga qaytaramiz
    onError: (_err, _id, context) => {
      if (context?.prevList) {
        queryClient.setQueryData(['student', 'notifications'], context.prevList)
      }
      if (context?.prevCount) {
        queryClient.setQueryData(['student', 'notifications', 'unread-count'], context.prevCount)
      }
    },

    // Muvaffaqiyatli bo'lsa — faqat bitta background refetch (spam emas)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] })
    },
  })
}

// ─── MARK ALL READ ────────────────────────────────────────────────────────────

export const useStudentMarkAllRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiClient.post<{ updated: number }>(NOTIFICATIONS.MARK_ALL_READ),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['student', 'notifications'] })
      await queryClient.cancelQueries({ queryKey: ['student', 'notifications', 'unread-count'] })

      const prevList = queryClient.getQueryData<StudentNotificationAPI[]>(['student', 'notifications'])
      const prevCount = queryClient.getQueryData<{ unread_count: number }>(['student', 'notifications', 'unread-count'])

      // Hammasini o'qilgan deb belgilaymiz
      queryClient.setQueryData<StudentNotificationAPI[]>(
        ['student', 'notifications'],
        (old) => old?.map((n) => ({ ...n, is_read: true })) ?? []
      )
      queryClient.setQueryData<{ unread_count: number }>(
        ['student', 'notifications', 'unread-count'],
        { unread_count: 0 }
      )

      return { prevList, prevCount }
    },

    onError: (_err, _vars, context) => {
      if (context?.prevList) {
        queryClient.setQueryData(['student', 'notifications'], context.prevList)
      }
      if (context?.prevCount) {
        queryClient.setQueryData(['student', 'notifications', 'unread-count'], context.prevCount)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] })
    },
  })
}

// ─── DELETE (bulk — 1 ta so'rov) ─────────────────────────────────────────────
// Backend bulk endpoint bo'lsa — bitta so'rov. Yo'q bo'lsa — Promise.all (parallel)

export const useStudentDeleteNotifications = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) => {
      // Agar backendda bulk delete endpoint mavjud bo'lsa (masalan DELETE /notifications/bulk/)
      // uni ishlatish tavsiya qilinadi — shunda 1 ta so'rov ketadi:
      //
      // return apiClient.delete(NOTIFICATIONS.BULK_DELETE, { data: { ids } })
      //
      // Hozircha parallel (bir vaqtda) yuboramiz — ketma-ket emas:
      return Promise.all(ids.map((id) => apiClient.delete<void>(NOTIFICATIONS.DELETE(id))))
    },

    // Optimistik — API javobini kutmasdan UI dan o'chirib qo'yamiz
    onMutate: async (ids: number[]) => {
      await queryClient.cancelQueries({ queryKey: ['student', 'notifications'] })

      const prevList = queryClient.getQueryData<StudentNotificationAPI[]>(['student', 'notifications'])

      queryClient.setQueryData<StudentNotificationAPI[]>(
        ['student', 'notifications'],
        (old) => old?.filter((n) => !ids.includes(n.id)) ?? []
      )

      return { prevList }
    },

    onError: (_err, _ids, context) => {
      if (context?.prevList) {
        queryClient.setQueryData(['student', 'notifications'], context.prevList)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] })
    },
  })
}

// ─── WebSocket ────────────────────────────────────────────────────────────────

function getWsBaseUrl(): string {
  const httpBase = import.meta.env.VITE_API_BASE_URL || ''
  if (httpBase && (httpBase.startsWith('http://') || httpBase.startsWith('https://'))) {
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

  const sessionToken = sessionStorage.getItem('linguapro_access_token')
  if (sessionToken) return sessionToken

  const localToken = localStorage.getItem('access_token')
  if (localToken) return localToken

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
    queryClient.refetchQueries({ queryKey: ['student', 'notifications'] })
    queryClient.refetchQueries({ queryKey: ['student', 'notifications', 'unread-count'] })
  }, [queryClient])

  const connect = useCallback(() => {
    if (isConnectingRef.current) return
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.CONNECTING ||
        wsRef.current.readyState === WebSocket.OPEN)
    ) return

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

      ws.onmessage = () => {
        invalidateNotifications()
      }

      ws.onclose = (event) => {
        isConnectingRef.current = false
        wsRef.current = null

        if (event.code >= 4000) return

        if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(30_000 * Math.pow(2, reconnectAttemptRef.current), 300_000)
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
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
      }
    }
  }, [connect, enabled])
}