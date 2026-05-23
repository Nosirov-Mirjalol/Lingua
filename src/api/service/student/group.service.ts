import { apiClient } from '@/api/client'
import { STUDENT } from '@/constants/apiEndPoints'

export interface StudentGroup {
  id: number
  name: string
  course_name?: string
  description?: string
  start_date?: string
  end_date?: string
  start_time?: string
  end_time?: string
  status?: string
  week_days?: string
  week_days_label?: string
  week_days_active?: string
  week_days_names?: string[]
  student_count?: number
  teacher_name?: string
  teacher?: {
    id?: number
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
  const normalizeGroup = (item: any): StudentGroup => {
    const teacherName = item.teacher_name || item.teacher?.full_name || item.teacher
    const teacher = typeof item.teacher === 'object' && item.teacher !== null
      ? item.teacher
      : teacherName
      ? { full_name: String(teacherName) }
      : undefined

    return {
      ...item,
      teacher,
      teacher_name: item.teacher_name || teacher?.full_name,
    }
  }

  // 1. If it's already a clean array of groups
  const direct = asGroupArray(raw)
  if (direct.length > 0 && direct[0].name) return direct.map(normalizeGroup)

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    
    // 2. Search in common nested keys
    const nestedKeys = [
      'results', 
      'data', 
      'groups', 
      'items', 
      'assigned_groups', 
      'my_groups', 
      'student_groups',
      'group_list'
    ]

    for (const key of nestedKeys) {
      const current = asGroupArray(record[key])
      if (current.length > 0) {
        // Handle membership objects: if array items have a 'group' property, use that
        return current.map(item => {
          const source = (item as any).group && typeof (item as any).group === 'object'
            ? { ...(item as any).group, membership_id: item.id }
            : item
          return normalizeGroup(source)
        })
      }
    }

    // 3. If it's a single object that looks like a group
    if ('id' in record && ('name' in record || 'group' in record)) {
      if ('group' in record && record.group && typeof record.group === 'object') {
        return [normalizeGroup(record.group)]
      }
      return [normalizeGroup(record)]
    }
  }

  return []
}

export const getMyGroups = async (): Promise<StudentGroup[]> => {
  try {
    const response = await apiClient.get<unknown>(STUDENT.ASSIGNED_GROUPS)
    return unwrapGroups(response)
  } catch {
    return []
  }
}

