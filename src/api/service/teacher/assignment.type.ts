export interface Assignment {
  id: number
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded'
  grade?: number
  maxGrade: number
  teacherId: number
  teacherName: string
  groupId: number
  groupName: string
  createdAt: string
  updatedAt: string
}

export interface AssignmentListParams {
  page?: number
  limit?: number
  status?: 'pending' | 'submitted' | 'graded'
  groupId?: number
  teacherId?: number
}

export interface CreateAssignmentPayload {
  title: string
  description: string
  dueDate: string
  maxGrade: number
  groupId: number
}

export interface UpdateAssignmentPayload {
  title?: string
  description?: string
  dueDate?: string
  maxGrade?: number
  status?: 'pending' | 'submitted' | 'graded'
}

export interface GradeAssignmentPayload {
  grade: number
  feedback?: string
}

export interface SubmitAssignmentPayload {
  content: string
  attachments?: string[]
}

export interface Submission {
  id: number
  assignmentId: number
  studentId: number
  content: string
  attachments?: string[]
  submittedAt: string
  grade?: number
  feedback?: string
}

export interface AssignmentListResponse {
  assignments: Assignment[]
  total: number
  page: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  status: 'success' | 'error'
}

export interface ApiError {
  message: string
  code: string
  details?: unknown
}
