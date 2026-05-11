import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { NOTIFICATIONS } from '@/constants/apiEndPoints'
import type { Notification } from './types'

export const useMyNotifications = () => {
  return useQuery({
    queryKey: ['notifications', 'my'],
    queryFn: () => apiClient.get<Notification[]>(NOTIFICATIONS.MY),
    staleTime: 30_000,
  })
}

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => apiClient.get<{ unread_count: number }>(NOTIFICATIONS.UNREAD_COUNT),
    refetchInterval: 60_000,
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => 
      apiClient.patch<{ detail: string }>(NOTIFICATIONS.MARK_READ(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] })
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
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
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })
}
