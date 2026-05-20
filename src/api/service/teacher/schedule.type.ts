export type LessonStatus = 'upcoming' | 'ongoing' | 'completed'

export interface GroupScheduleItem {
  id: number
  name: string
  course_name: string
  start_time: string // HH:MM:SS format
  end_time: string // HH:MM:SS format
  student_count: string | number
  lesson_status: LessonStatus
}

export type ScheduleResponse = GroupScheduleItem[]
