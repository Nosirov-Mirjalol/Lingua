export interface Assignment {
  id: number
  title: string
  description: string
  group: number
  created_by: string
  deadline: string
  max_score: number
  attachment: string | null
  submission_type: 'text' | 'file'
  is_submitted?: boolean
  submitted_at?: string | null
  created_at: string
  is_active: boolean
}

export interface AssignmentUploadResponse {
  file_path: string
  file_url: string
  file_name: string
  file_size: number
}

export interface Submission {
  id: number
  assignment: number
  assignment_title: string
  student: string
  text_answer: string
  file_answer: string
  file_url?: string
  score: number
  submitted_at: string
  is_submitted: boolean
}

export type AssignmentListParams = {
  ordering?: string
  search?: string
  page?: number
  page_size?: number
}

export type CreateAssignmentPayload = Omit<
  Assignment,
  'id' | 'created_at' | 'created_by'
>

export type UpdateAssignmentPayload = Partial<CreateAssignmentPayload>

export type GradeAssignmentPayload = {
  score: number
}

export type SubmitAssignmentPayload = {
  assignment: number
  text_answer?: string
  file_answer?: string | File
  file_path?: string
}

export interface AssignmentStatus {
  id: number
  student: number
  student_name: string
  status: 'topshirgan' | 'topshirmagan'
  submitted_at?: string
}
