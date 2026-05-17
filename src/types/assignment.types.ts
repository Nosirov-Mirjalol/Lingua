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
  created_at: string
  is_active: boolean
}

export interface Submission {
  id: number
  assignment: number
  assignment_title: string
  student: string
  text_answer: string
  file_answer: string
  score: number
  submitted_at: string
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
  text_answer?: string
  file_answer?: string
}
