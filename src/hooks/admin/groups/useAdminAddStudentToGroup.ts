import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addStudentToAdminGroup,
  studentListItemToGroupMember,
} from '@/api/service/admin/group.service'
import type { Group, GroupStudent } from '@/api/service/teacher/group.type'
import type {
  AddStudentPayload,
  StudentListItem,
} from '@/api/service/teacher/group.type'

export type AddStudentToGroupVariables = {
  payload: AddStudentPayload
  picked: StudentListItem
}

function appendStudentToGroup(group: Group, picked: StudentListItem): Group {
  const member = studentListItemToGroupMember(picked)
  const exists = group.students.some((s) => s.student === member.student)
  if (exists) return group
  return {
    ...group,
    students: [...group.students, member],
  }
}

function resolveBaseGroup(
  queryClient: ReturnType<typeof useQueryClient>,
  groupId: number
): Group {
  const cached = queryClient.getQueryData<Group>([
    'admin',
    'groups',
    'students',
    groupId,
  ])
  if (cached) return cached

  const fromList = queryClient
    .getQueryData<Group[]>(['admin', 'groups', 'list'])
    ?.find((g) => g.id === groupId)

  if (fromList) return fromList

  return {
    id: groupId,
    name: '',
    course: 0,
    teacher: 0,
    status: 'active',
    start_date: '',
    students: [],
  }
}

export const useAdminAddStudentToGroup = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ payload }: AddStudentToGroupVariables) =>
      addStudentToAdminGroup(groupId, payload),
    onSuccess: (_res, { picked }) => {
      const base = resolveBaseGroup(queryClient, groupId)
      const updated = appendStudentToGroup(base, picked)

      queryClient.setQueryData<Group>(
        ['admin', 'groups', 'students', groupId],
        updated
      )

      queryClient.setQueryData<Group[]>(['admin', 'groups', 'list'], (old) =>
        old?.map((g) => (g.id === groupId ? updated : g))
      )

      void queryClient.invalidateQueries({
        queryKey: ['admin', 'groups', groupId, 'available-students'],
      })
    },
  })
}

export function mergeEnrolledStudents(
  current: GroupStudent[],
  incoming: GroupStudent[]
): GroupStudent[] {
  const map = new Map<number, GroupStudent>()
  for (const s of current) map.set(s.student, s)
  for (const s of incoming) map.set(s.student, s)
  return Array.from(map.values())
}
