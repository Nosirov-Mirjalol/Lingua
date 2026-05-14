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

function asGroupArray(value: unknown): StudentGroup[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is StudentGroup => !!item && typeof item === 'object'
  )
}

function unwrapGroups(raw: unknown): StudentGroup[] {
  const direct = asGroupArray(raw)
  if (direct.length > 0) return direct

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    const nestedKeys = ['results', 'data', 'groups', 'items']

    for (const key of nestedKeys) {
      const current = asGroupArray(record[key])
      if (current.length > 0) return current
    }
  }

  return []
}

export const getMyGroups = async (): Promise<StudentGroup[]> => {
  try {
    const response = await apiClient.get<unknown>(STUDENT.ASSIGNED_GROUPS)
    return unwrapGroups(response)
  } catch (error) {
    console.error('Error fetching student groups:', error)
    return []
  }
}

