import {
  addStudentToGroupApi,
  fetchAvailableStudents,
  fetchGroupEnrolledStudents,
  fetchMyGroups,
  fetchStudentsList,
  fetchTeachersList,
  removeStudentFromGroupApi,
} from '@/api/service/group/group-members.service'
import type {
  AddStudentPayload,
  Group,
  MessageResponse,
  StudentListItem,
} from './group.type'

export type { TeacherListItem } from '@/api/service/group/group-members.service'

/** GET /api/groups/my/ */
export const getTeacherGroups = (): Promise<Group[]> => fetchMyGroups()

/** GET /api/groups/students-list/ */
export const getStudentsList = (search?: string): Promise<StudentListItem[]> =>
  fetchStudentsList(search)

/** GET /api/groups/teachers-list/ */
export const getTeachersList = (search?: string) => fetchTeachersList(search)

/** GET /api/groups/{id}/available-students/ */
export const getAvailableStudents = (
  groupId: number,
  search?: string
): Promise<StudentListItem[]> => fetchAvailableStudents(groupId, search)

/** POST /api/groups/{id}/add-student/ */
export const addStudentToGroup = (
  groupId: number,
  data: AddStudentPayload
): Promise<MessageResponse> => addStudentToGroupApi(groupId, data)

/** DELETE /api/groups/{id}/remove-student/{sid}/ */
export const removeStudentFromGroup = (
  groupId: number,
  studentId: number
): Promise<MessageResponse> =>
  removeStudentFromGroupApi(groupId, studentId)

export const getGroupStudents = (groupId: number) =>
  fetchGroupEnrolledStudents(groupId)
