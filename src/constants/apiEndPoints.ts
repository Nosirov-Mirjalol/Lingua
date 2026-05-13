const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login/',
    FORGOT_PASSWORD: '/api/auth/forgot-password/',
    VERIFY_PASSWORD: '/api/auth/verfiy-password/',
    USER_LIST: '/api/auth/user-list/',
    PROFILE_GET: '/api/auth/my-profile-list/',
    PROFILE_UPDATE: '/api/auth/my-profile-update-delete/',
  },
  ATTENDANCE: {
    LIST: '/api/attendance/list',
    MY: '/api/attendance/my/',
    BULK_UPDATE: '/api/attendance/bulk-update/',
    GROUP_ATTENDANCE: (groupId: number) => `/api/attendance/stats/${groupId}/`,
    UPDATE: (id: number) => `/api/attendance/update/${id}/`,
  },
  GROUP: {
    MY: '/api/groups/my/',
    STUDENTS_LIST: '/api/groups/students-list/',
    CREATE_ADMIN: '/api/groups/create-admin/',
    LIST_ADMIN: '/api/groups/list-admin/',
    UPDATE_DELETE_ADMIN: (groupId: number) =>
      `/api/groups/update-delete-admin/${groupId}/`,
    AVAILABLE_STUDENTS: (groupId: number) =>
      `/api/groups/${groupId}/available-students/`,
    ADD_STUDENT: (groupId: number) => `/api/groups/${groupId}/add-student/`,
    REMOVE_STUDENT: (groupId: number, studentId: number) =>
      `/api/groups/${groupId}/remove-student/${studentId}/`,
  },
  COURSE: {
    CREATE: '/api/courses/create/',
    LIST: '/api/courses/list/',
    UPDATE_DELETE: (courseId: number) =>
      `/api/courses/update-delete/${courseId}/`,
  },
  NOTIFICATIONS: {
    MY: '/api/notifications/my/',
    MARK_READ: (id: number) => `/api/notifications/${id}/read/`,
    MARK_ALL_READ: '/api/notifications/read-all/',
    UNREAD_COUNT: '/api/notifications/unread-count/',
  },
  MESSAGES: {
    GROUPS: '/api/messages/',
    GROUP_MESSAGES: (groupId: number) => `/api/messages/${groupId}/messages/`,
    SEND: (groupId: number) => `/api/messages/${groupId}/send/`,
    DELETE: (groupId: number, messageId: number) =>
      `/api/messages/${groupId}/messages/${messageId}/`,
    UNREAD_COUNT: '/api/messages/unread-count/',
  },
  USER: {
    USER_ME: '/user',
  },
}

export const {  AUTH,ATTENDANCE, GROUP,COURSE,NOTIFICATIONS,MESSAGES,USER,} = API_ENDPOINTS
