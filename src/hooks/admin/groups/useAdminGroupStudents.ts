import { useQuery } from '@tanstack/react-query'
import { fetchGroupEnrolledStudents } from '@/api/service/group/group-members.service'
import { useMyGroups } from '@/hooks/groups/useMyGroups'

/**
 * Guruh talabalari:
 * - GET /api/groups/my/ (students[])
 * - yoki students-list − available-students
 */
export const useAdminGroupStudents = (groupId: number | null) => {
  const enabled = groupId != null && groupId > 0
  const gid = groupId ?? 0

  const myQuery = useMyGroups(enabled)

  const enrolledQuery = useQuery({
    queryKey: ['admin', 'groups', gid, 'enrolled'],
    queryFn: () => fetchGroupEnrolledStudents(gid),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  const groupMeta = myQuery.data?.find((g) => Number(g.id) === gid)

  return {
    isLoading: myQuery.isLoading || enrolledQuery.isLoading,
    isFetching: myQuery.isFetching || enrolledQuery.isFetching,
    isError: myQuery.isError || enrolledQuery.isError,
    refetch: async () => {
      await Promise.all([myQuery.refetch(), enrolledQuery.refetch()])
    },
    data: groupMeta
      ? { ...groupMeta, students: enrolledQuery.data ?? [] }
      : enrolledQuery.data?.length
        ? {
            id: gid,
            name: '',
            course: 0,
            teacher: 0,
            status: 'active' as const,
            start_date: '',
            students: enrolledQuery.data,
          }
        : undefined,
  }
}
