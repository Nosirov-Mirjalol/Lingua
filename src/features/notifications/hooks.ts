import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { NOTIFICATIONS } from '@/constants/apiEndPoints'
import type { Notification } from './types'

type NotificationQueryOptions = {
  enabled?: boolean
}

export const useMyNotifications = () => {
  return useQuery({
    queryKey: ['notifications', 'my'],
    queryFn: () => apiClient.get<Notification[]>(NOTIFICATIONS.MY),
    staleTime: 30_000,
  })
}

export const useUnreadCount = (
  { enabled = true }: NotificationQueryOptions = {}
) => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () =>
      apiClient.get<{ unread_count: number }>(NOTIFICATIONS.UNREAD_COUNT),
    enabled,
    staleTime: 300_000, // 5 daqiqa
    refetchInterval: 300_000, // 5 daqiqa
    refetchOnWindowFocus: false,
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      apiClient.patch<{ detail: string }>(NOTIFICATIONS.MARK_READ(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] })
      await queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    },
  })
}

export const useMarkAllRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiClient.post<{ updated: number }>(NOTIFICATIONS.MARK_ALL_READ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] })
      await queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    },
  })
}

export const useBroadcastList = () => {
  return useQuery({
    queryKey: ['notifications', 'broadcast', 'list'],
    queryFn: () => apiClient.get<Notification[]>(NOTIFICATIONS.BROADCAST_LIST),
    staleTime: 60_000,
  })
}

export const useSendBroadcast = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { title: string; message: string; type?: string }) =>
      apiClient.post<Notification>(NOTIFICATIONS.BROADCAST_SEND, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['notifications', 'broadcast', 'list'],
      })
    },
  })
}
