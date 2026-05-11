import { createFileRoute } from '@tanstack/react-router'
import TeacherGroupsPage from '@/features/teacher-groups'

export const Route = createFileRoute('/_authenticated/teachers/$teacherId/groups/')({
  component: TeacherGroupsPage,
})
