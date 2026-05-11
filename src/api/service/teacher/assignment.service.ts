import { apiClient } from '@/api/client'
import {
  ASSIGNMENTS,
  ASSIGNMENT_BY_ID,
  ASSIGNMENT_GRADE,
  ASSIGNMENT_SUBMIT,
} from '@/constants/assignmentEndPoints'
import type {
  ApiError,
  Assignment,
  AssignmentListParams,
  AssignmentListResponse,
  CreateAssignmentPayload,
  GradeAssignmentPayload,
  Submission,
  SubmitAssignmentPayload,
  UpdateAssignmentPayload,
} from './assignment.type'

// Enhanced error handling wrapper
const handleApiCall = async <T>(
  apiCall: () => Promise<T>,
  errorMessage: string
): Promise<T> => {
  try {
    const result = await apiCall()
    return result
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`${errorMessage}:`, error)

    // Transform error to standard format
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : errorMessage,
      code: error instanceof Error ? 'UNKNOWN_ERROR' : 'API_ERROR',
      details: error,
    }

    throw apiError
  }
}

export const getAssignments = async (
  params?: AssignmentListParams
): Promise<Assignment[]> => {
  return handleApiCall(
    () => apiClient.get<Assignment[]>(ASSIGNMENTS, { params }),
    'Failed to fetch assignments'
  )
}

export const createAssignment = async (
  payload: CreateAssignmentPayload
): Promise<Assignment> => {
  // Validate payload before sending
  if (!payload.title || !payload.title.trim()) {
    throw new Error('Assignment title is required')
  }

  if (!payload.groupId) {
    throw new Error('Group ID is required')
  }

  if (!payload.dueDate) {
    throw new Error('Due date is required')
  }

  if (payload.maxGrade <= 0) {
    throw new Error('Maximum grade must be greater than 0')
  }

  return handleApiCall(
    () => apiClient.post<Assignment>(ASSIGNMENTS, payload),
    'Failed to create assignment'
  )
}

export const getAssignmentById = async (id: number): Promise<Assignment> => {
  if (!id || id <= 0) {
    throw new Error('Valid assignment ID is required')
  }

  return handleApiCall(
    () => apiClient.get<Assignment>(ASSIGNMENT_BY_ID(id)),
    `Failed to fetch assignment with ID: ${id}`
  )
}

export const updateAssignment = async (
  id: number,
  payload: UpdateAssignmentPayload
): Promise<Assignment> => {
  if (!id || id <= 0) {
    throw new Error('Valid assignment ID is required')
  }

  // Validate update payload
  if (payload.maxGrade !== undefined && payload.maxGrade <= 0) {
    throw new Error('Maximum grade must be greater than 0')
  }

  return handleApiCall(
    () => apiClient.put<Assignment>(ASSIGNMENT_BY_ID(id), payload),
    `Failed to update assignment with ID: ${id}`
  )
}

export const deleteAssignment = async (
  id: number
): Promise<{ detail?: string }> => {
  if (!id || id <= 0) {
    throw new Error('Valid assignment ID is required')
  }

  return handleApiCall(
    () => apiClient.delete<{ detail?: string }>(ASSIGNMENT_BY_ID(id)),
    `Failed to delete assignment with ID: ${id}`
  )
}

export const submitAssignment = async (
  id: number,
  payload: SubmitAssignmentPayload
): Promise<Submission> => {
  if (!id || id <= 0) {
    throw new Error('Valid assignment ID is required')
  }

  if (!payload.content || !payload.content.trim()) {
    throw new Error('Assignment content is required for submission')
  }

  return handleApiCall(
    () => apiClient.post<Submission>(ASSIGNMENT_SUBMIT(id), payload),
    `Failed to submit assignment with ID: ${id}`
  )
}

export const gradeAssignment = async (
  id: number,
  payload: GradeAssignmentPayload
): Promise<Submission> => {
  if (!id || id <= 0) {
    throw new Error('Valid assignment ID is required')
  }

  if (payload.grade < 0) {
    throw new Error('Grade cannot be negative')
  }

  return handleApiCall(
    () => apiClient.put<Submission>(ASSIGNMENT_GRADE(id), payload),
    `Failed to grade assignment with ID: ${id}`
  )
}

export const getAssignmentsList = async (
  params?: AssignmentListParams
): Promise<AssignmentListResponse> => {
  return handleApiCall(
    () => apiClient.get<AssignmentListResponse>(ASSIGNMENTS, { params }),
    'Failed to fetch assignments list'
  )
}

// Utility function to check if assignment exists
export const checkAssignmentExists = async (id: number): Promise<boolean> => {
  try {
    await getAssignmentById(id)
    return true
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return false
    }
    throw error
  }
}

// Bulk operations
export const bulkUpdateAssignments = async (
  updates: Array<{ id: number; payload: UpdateAssignmentPayload }>
): Promise<Assignment[]> => {
  const results = await Promise.allSettled(
    updates.map(({ id, payload }) => updateAssignment(id, payload))
  )

  const successfulUpdates: Assignment[] = []
  const failedUpdates: Array<{ id: number; error: Error }> = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successfulUpdates.push(result.value)
    } else {
      failedUpdates.push({
        id: updates[index].id,
        error: result.reason,
      })
    }
  })

  if (failedUpdates.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('Some assignments failed to update:', failedUpdates)
  }

  return successfulUpdates
}
