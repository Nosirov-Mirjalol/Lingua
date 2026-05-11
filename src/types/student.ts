export interface StudentProfile {
  id: number
  username: string
  full_name: string
  role: string
  email: string
  phone: string
  avatar: string
  activeCourse: string
  nextLesson: string
  completion: number
  attendance: number
  streak: number
  goal: string
}

export interface StudentDashboardStats {
  upcomingLessons: number
  completedHours: string
  progress: number
  unreadMessages: number
}

export interface StudentScheduleItem {
  id: number
  day: string
  time: string
  title: string
  location: string
  instructor: string
  status: 'Upcoming' | 'Live' | 'Completed'
}

export interface StudentAssignment {
  id: number
  title: string
  course: string
  dueDate: string
  status: 'Pending' | 'Submitted' | 'Late'
  completion: number
}

export interface StudentConversationMessage {
  id: number
  sender: 'student' | 'teacher'
  body: string
  time: string
}

export interface StudentConversation {
  id: number
  participant: string
  subject: string
  lastMessage: string
  time: string
  unread: number
  messages: StudentConversationMessage[]
}

export interface StudentCourse {
  id: number
  title: string
  instructor: string
  progress: number
  duration: string
  nextModule: string
  badge: string
}


export type HomeworkStatus = 'pending' | 'submitted' | 'late' | 'completed'

export interface FileAttachment {
  id: string
  name: string
  size: string
  url: string
  mimeType: string
  uploadedAt: string
}

export interface Homework {
  id: string
  title: string
  groupName: string
  studentName: string
  studentAvatar: string
  teacherName: string
  teacherAvatar: string
  teacherRole: string
  subject: string
  dueDate: string
  gradeWeight: string
  status: HomeworkStatus
  description: string
  requirements: string[]
  attachedFiles: FileAttachment[]
}

export interface HomeworkMessage {
  id: string
  homeworkId: string
  senderId: string
  senderName: string
  senderAvatar: string
  senderRole: 'teacher' | 'student'
  content: string
  timestamp: string
  isRead: boolean
  type: 'text' | 'file' | 'homework_card'
  file?: FileAttachment
}

