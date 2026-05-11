import { apiClient } from '@/api/client'
import { ATTENDANCE } from '@/constants/apiEndPoints'
import type {
  AttendanceCreateRequest,
  AttendanceBulkUpdateRequest,
  AttendanceGroupAttendanceRequest,
  AttendanceItem,
  AttendanceListParams,
  MyAttendanceItem,
  AttendanceUpdateRequest,
} from './attendance.type'

export const getAttendanceList = (
  params?: AttendanceListParams
): Promise<AttendanceItem[]> => {
  return apiClient.get<AttendanceItem[]>(ATTENDANCE.LIST, { params })
}

export const createAttendance = (
  data: AttendanceCreateRequest
): Promise<AttendanceItem> => {
  return apiClient.post<AttendanceItem>(ATTENDANCE.LIST, data)
}

export const updateAttendance = (
  id: number,
  data: AttendanceUpdateRequest
): Promise<AttendanceItem> => {
  return apiClient.patch<AttendanceItem>(ATTENDANCE.UPDATE(id), data)
}

export const bulkUpdateAttendance = (
  data: AttendanceBulkUpdateRequest
): Promise<AttendanceItem[]> => {
  return apiClient.put<AttendanceItem[]>(ATTENDANCE.BULK_UPDATE, data)
}

export const getMyAttendance = (): Promise<MyAttendanceItem[]> => {
  return apiClient.get<MyAttendanceItem[]>(ATTENDANCE.MY)
}

export const groupAttendance = (
  groupId: number,
  data: AttendanceGroupAttendanceRequest
): Promise<AttendanceItem[]> => {
  return apiClient.post<AttendanceItem[]>(
    ATTENDANCE.GROUP_ATTENDANCE(groupId),
    data
  )
}
