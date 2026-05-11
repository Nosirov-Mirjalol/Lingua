import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  gradeAssignment,
  submitAssignment,
  updateAssignment,
} from '@/services/assignment.service'
import type {
  AssignmentListParams,
  CreateAssignmentPayload,
  GradeAssignmentPayload,
  SubmitAssignmentPayload,
  UpdateAssignmentPayload,
} from '@/types/assignment.types'

export const useGetAssignments = (params?: AssignmentListParams) => {
  return useQuery({
    queryKey: ['assignments', params],
    queryFn: () => getAssignments(params),
  })
}

export const useCreateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => createAssignment(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['assignments'] })
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAssignment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export const useGradeAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: GradeAssignmentPayload
    }) => gradeAssignment(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: SubmitAssignmentPayload
    }) => submitAssignment(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}
