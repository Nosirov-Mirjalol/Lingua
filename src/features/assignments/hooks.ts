import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAssignment,
  deleteAssignment,
  getAssignmentById,
  getAssignments,
  updateAssignment,
} from '@/api/service/teacher/assignment.service'
import type {
  AssignmentListParams,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from '@/api/service/teacher/assignment.type'

type RetryError = {
  response?: {
    status?: number
  }
}

export const useAssignments = (params?: AssignmentListParams) => {
  return useQuery({
    queryKey: ['assignments', params],
    queryFn: () => getAssignments(params),
    staleTime: 30_000,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (
        error &&
        'response' in error &&
        (error as RetryError).response?.status === 404
      ) {
        // eslint-disable-next-line no-console
        console.error('404 Error detected, stopping retry')
        return false
      }
      return failureCount < 3
    },
  })
}

export const useAssignmentById = (id: number) => {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: () => getAssignmentById(id),
    enabled: !!id,
  })
}

export const useCreateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => createAssignment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateAssignmentPayload
    }) => updateAssignment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}
