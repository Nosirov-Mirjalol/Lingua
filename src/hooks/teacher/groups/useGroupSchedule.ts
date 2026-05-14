import { useQuery } from '@tanstack/react-query'
import {
  getGroupSchedule,
  getTodaySchedule,
} from '@/api/service/teacher/schedule.service'

/**
 * Fetch schedule for a specific date or today if no date is provided
 * @param date - Optional date in YYYY-MM-DD format
 */
export const useGroupSchedule = (date?: string) => {
  return useQuery({
    queryKey: ['teacher', 'schedule', date || 'today'],
    queryFn: () => getGroupSchedule(date),
    enabled: true,
  })
}

/**
 * Fetch today's schedule with time-based statuses
 */
export const useTodaySchedule = () => {
  return useQuery({
    queryKey: ['teacher', 'schedule', 'today-real-time'],
    queryFn: getTodaySchedule,
    enabled: true,
    // Refetch every minute to update statuses (upcoming/ongoing/completed)
    refetchInterval: 60_000,
  })
}
