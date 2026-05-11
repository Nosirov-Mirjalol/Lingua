import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAssignments } from '@/api/service/teacher/assignment.service'
import type {
  Assignment,
  AssignmentListParams,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from '@/api/service/teacher/assignment.type'

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
        (error.response as any)?.status === 404
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
    queryFn: () => apiClient.get<Assignment>(`${ASSIGNMENTS}${id}/`),
    enabled: !!id,
  })
}

export const useCreateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) =>
      apiClient.post<Assignment>(ASSIGNMENTS, payload),
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
    }) => apiClient.put<Assignment>(`${ASSIGNMENTS}${id}/`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`${ASSIGNMENTS}${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}
