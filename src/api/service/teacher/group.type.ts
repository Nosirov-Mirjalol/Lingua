export type GroupStatus = 'active'

export interface GroupStudent {
  id: number
  student: number
  student_name?: string | null
  full_name?: string | null
  username?: string | null
  joined_at: string
}

export interface StudentListItem {
  id: number
  username: string
  full_name?: string | null
  phone?: string | null
  avatar?: string | null
  learning_goal?: string | null
}

export interface Group {
  id: number
  name: string
  course: number
  teacher: number
  teacher_name?: string
  status: GroupStatus
  start_date: string
  start_time?: string
  end_time?: string
  week_days?: string | string[]
  week_days_type?: 'odd' | 'even' | 'custom'
  students: GroupStudent[]
}

export interface AddStudentPayload {
  username: string
}

export interface MessageResponse {
  detail: string
}
