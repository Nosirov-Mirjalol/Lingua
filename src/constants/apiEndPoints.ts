const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login/',
    FORGOT_PASSWORD: '/api/auth/forgot-password/',
    VERIFY_PASSWORD: '/api/auth/verfiy-password/',
    USER_LIST: '/api/auth/user-list/',
    PROFILE_GET: '/api/auth/my-profile-list/',
    PROFILE_UPDATE: '/api/auth/my-profile-update/',
    PROFILE_DELETE: (userId: number) => `/api/auth/profile-delete/${userId}/`,
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
    SCHEDULE: '/api/groups/schedule/',
    TODAY_SCHEDULE: '/api/groups/today-schedule/',
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
    BROADCAST_LIST: '/api/notifications/broadcast/list/',
    BROADCAST_SEND: '/api/notifications/broadcast/',
  },
  MESSAGES: {
    GROUPS: '/api/messages/',
    GROUP_MESSAGES: (groupId: number) => `/api/messages/${groupId}/messages/`,
    SEND: (groupId: number) => `/api/messages/${groupId}/send/`,
    MARK_READ: (groupId: number) => `/api/messages/${groupId}/read/`,
    DELETE: (groupId: number, messageId: number) =>
      `/api/messages/${groupId}/messages/${messageId}/`,
    UNREAD_COUNT: '/api/messages/unread-count/',
  },
  USER: {
    USER_ME: '/user',
  },
  STUDENT: {
    ASSIGNED_GROUPS: '/api/groups/my/',
  },
  ASSIGNMENTS: {
    LIST: '/api/assignments/',
    BY_ID: (id: number) => `/api/assignments/${id}/`,
    SUBMIT: (id: number) => `/api/assignments/${id}/submit/`,
    GRADE: (id: number) => `/api/assignments/${id}/grade/`,
<<<<<<< HEAD
=======
    STATUS: (id: number) => `/api/assignments/${id}/status/`,
>>>>>>> b6612ff0a0c190d6006744c9e600144354c1074d
  },
}

export const {
  AUTH,
  ATTENDANCE,
  GROUP,
  COURSE,
  NOTIFICATIONS,
  MESSAGES,
  USER,
  STUDENT,
  ASSIGNMENTS,
} = API_ENDPOINTS
