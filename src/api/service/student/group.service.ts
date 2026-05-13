import { apiClient } from '@/api/client'
import { STUDENT } from '@/constants/apiEndPoints'

export interface StudentGroup {
  id: number
  name: string
  description?: string
  start_date?: string
  start_time?: string
  end_time?: string
  status?: string
  teacher?: {
    id: number
    full_name: string
    avatar?: string
  }
}

export const getMyGroups = async (): Promise<StudentGroup[]> => {
  try {
    const response = await apiClient.get<StudentGroup[]>(STUDENT.ASSIGNED_GROUPS)
    return response
  } catch (error) {
    console.error('Error fetching student groups:', error)
    return []
  }
}
