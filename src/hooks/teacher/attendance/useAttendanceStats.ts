import { useQuery } from '@tanstack/react-query'

export const useAttendanceStats = (groupId: number) => {
  return useQuery({
    queryKey: ['attendance', 'stats', groupId],
    queryFn: async () => {
      throw new Error(
        'useAttendanceStats is no longer supported. Use local computed stats and /api/attendance/stats/{group_id}/ upsert for saving.'
      )
    },
    enabled: !!groupId,
  })
}
