import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMyGroups } from '@/api/service/group/group-members.service'
import { GROUP } from '@/constants/apiEndPoints'
import { apiClient } from '@/api/client'
import type { Group } from '@/api/service/teacher/group.type'
import { MY_GROUPS_KEY } from '@/hooks/groups/useMyGroups'

function unwrapAdminList(raw: unknown): Group[] {
  const list = Array.isArray(raw)
    ? raw
    : raw &&
        typeof raw === 'object' &&
        Array.isArray((raw as { results?: unknown }).results)
      ? (raw as { results: unknown[] }).results
      : []
  return list
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const r = item as Record<string, unknown>
      const id = typeof r.id === 'number' ? r.id : Number(r.id)
      if (!Number.isFinite(id)) return null
      const course = Number(r.course)
      const teacher = Number(r.teacher)
      return {
        id,
        name: String(r.name ?? ''),
        course: Number.isFinite(course) ? course : 0,
        teacher: Number.isFinite(teacher) ? teacher : 0,
        teacher_name:
          typeof r.teacher_name === 'string' ? r.teacher_name : undefined,
        status: (r.status === 'completed' ? 'completed' : 'active') as Group['status'],
        start_date: String(r.start_date ?? ''),
        start_time:
          typeof r.start_time === 'string' ? r.start_time : undefined,
        end_time: typeof r.end_time === 'string' ? r.end_time : undefined,
        week_days: r.week_days as Group['week_days'],
        week_days_type: r.week_days_type as Group['week_days_type'],
        students: [] as Group['students'],
      }
    })
    .filter((g): g is Group => g !== null)
}

export const useAdminGroups = () => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['admin', 'groups', 'list'],
    queryFn: async () => {
      const myGroups = await queryClient.fetchQuery({
        queryKey: MY_GROUPS_KEY,
        queryFn: () => fetchMyGroups(),
        staleTime: 30_000,
      })
      const listRaw = await apiClient.get<unknown>(GROUP.LIST_ADMIN)
      const list = unwrapAdminList(listRaw)

      return list.map((g) => ({
        ...g,
        students: myGroups.find((m) => Number(m.id) === g.id)?.students ?? [],
      }))
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}
