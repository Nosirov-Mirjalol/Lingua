import { apiClient } from '@/api/client'
import { GROUP } from '@/constants/apiEndPoints'
import type {
  AddStudentPayload,
  Group,
  MessageResponse,
  StudentListItem,
} from './group.type'

export const getTeacherGroups = (): Promise<Group[]> => {
  return apiClient.get<Group[]>(GROUP.MY)
}

export const getStudentsList = (): Promise<StudentListItem[]> => {
  return apiClient.get<StudentListItem[]>(GROUP.STUDENTS_LIST)
}

export const getAvailableStudents = (
  groupId: number
): Promise<StudentListItem[]> => {
  return apiClient.get<StudentListItem[]>(GROUP.AVAILABLE_STUDENTS(groupId))
}

export const addStudentToGroup = (
  groupId: number,
  data: AddStudentPayload
): Promise<MessageResponse> => {
  return apiClient.post<MessageResponse>(GROUP.ADD_STUDENT(groupId), data)
}

export const removeStudentFromGroup = (
  groupId: number,
  studentId: number
): Promise<MessageResponse> => {
  return apiClient.delete<MessageResponse>(GROUP.REMOVE_STUDENT(groupId, studentId))
}
