const ASSIGNMENT_ENDPOINTS = {
  ASSIGNMENTS: '/api/assignments/',
  ASSIGNMENT_BY_ID: (id: number) => `/api/assignments/${id}/`,
  ASSIGNMENT_SUBMIT: (id: number) => `/api/assignments/${id}/submit/`,
  ASSIGNMENT_GRADE: (id: number) => `/api/assignments/${id}/grade/`,
}

export const {
  ASSIGNMENTS,
  ASSIGNMENT_BY_ID,
  ASSIGNMENT_SUBMIT,
  ASSIGNMENT_GRADE,
} = ASSIGNMENT_ENDPOINTS
