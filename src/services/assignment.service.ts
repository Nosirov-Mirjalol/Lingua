import type {
  Assignment,
  AssignmentListParams,
  AssignmentUploadResponse,
  CreateAssignmentPayload,
  GradeAssignmentPayload,
  Submission,
  SubmitAssignmentPayload,
  UpdateAssignmentPayload,
} from '@/types/assignment.types'
import { apiClient } from '@/api/client'

const ASSIGNMENTS_LIST_CREATE = '/api/assignments/list-create/'
const ASSIGNMENTS_BY_ID = (id: number) => `/api/assignments/${id}/`
const ASSIGNMENTS_GRADE = (id: number) => `/api/assignments/${id}/grade/`
const ASSIGNMENTS_SUBMIT = (id: number) => `/api/assignments/${id}/submit/`
const ASSIGNMENTS_UPLOAD = '/api/assignments/upload/'
const ASSIGNMENTS_STATUS = (id: number) => `/api/assignments/${id}/status/`
export const getAssignments = (
  params?: AssignmentListParams
): Promise<Assignment[]> => {
  return apiClient.get<Assignment[]>(ASSIGNMENTS_LIST_CREATE, { params })
}

export const getMyAssignments = (
  params?: AssignmentListParams
): Promise<Assignment[]> => {
  return apiClient.get<Assignment[]>('/api/assignments/my/', { params })
}

export const createAssignment = (
  payload: CreateAssignmentPayload
): Promise<Assignment> => {
  return apiClient.post<Assignment>(ASSIGNMENTS_LIST_CREATE, payload)
}

export const updateAssignment = (
  id: number,
  payload: UpdateAssignmentPayload
): Promise<Assignment> => {
  return apiClient.put<Assignment>(ASSIGNMENTS_BY_ID(id), payload)
}

export const deleteAssignment = (id: number): Promise<{ detail?: string }> => {
  return apiClient.delete<{ detail?: string }>(ASSIGNMENTS_BY_ID(id))
}

export const gradeAssignment = (
  id: number,
  payload: GradeAssignmentPayload
): Promise<Submission> => {
  return apiClient.put<Submission>(ASSIGNMENTS_GRADE(id), payload)
}

export const uploadAssignmentFile = (
  file: File
): Promise<AssignmentUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient.post<AssignmentUploadResponse>(ASSIGNMENTS_UPLOAD, formData)
}

export const submitAssignment = (
  id: number,
  payload: SubmitAssignmentPayload | FormData
): Promise<Submission> => {
  return apiClient.post<Submission>(ASSIGNMENTS_SUBMIT(id), payload)
}

export const getAssignmentStatus = (id: number): Promise<any> => {
  return apiClient.get<any>(ASSIGNMENTS_STATUS(id))
}
