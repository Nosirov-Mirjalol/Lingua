import { apiClient } from '@/api/client'
import { GROUP } from '@/constants/apiEndPoints'
import type { GroupScheduleItem } from './schedule.type'

export const getGroupSchedule = (
  date?: string
): Promise<GroupScheduleItem[]> => {
  const params = new URLSearchParams()
  if (date) {
    params.append('date', date)
  }
  const url = `${GROUP.SCHEDULE}${params.toString() ? '?' + params.toString() : ''}`
  return apiClient.get<GroupScheduleItem[]>(url)
}

export const getTodaySchedule = (): Promise<GroupScheduleItem[]> => {
  return apiClient.get<GroupScheduleItem[]>(GROUP.TODAY_SCHEDULE)
}
