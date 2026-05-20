export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface AttendanceItem {
  id: number
  student: number
  student_name: string
  group: number
  group_name: string
  date: string
  status: AttendanceStatus
  note?: string
  marked_by: number
  marked_by_name: string
  created_at: string
}

export interface AttendanceCreateRequest {
  student: number
  group: number
  date: string
  status: AttendanceStatus
  note?: string
}

export interface AttendanceUpdateRequest {
  status?: AttendanceStatus
  note?: string
}

export interface AttendanceBulkUpdateRequest {
  records: { id: number; status: AttendanceStatus; note?: string }[]
}

export interface AttendanceGroupAttendanceRequest {
  date: string
  records: { student: number; status: AttendanceStatus; note?: string }[]
}

export interface MyAttendanceItem {
  id: number
  group: number
  group_name: string
  date: string
  status: AttendanceStatus
  note?: string
  created_at: string
}

export interface AttendanceListParams {
  ordering?: string
  search?: string
}
