// This route is deprecated - use /admin-students instead
// Redirect to admin-students
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/students/')({
  beforeLoad: () => {
    throw redirect({ to: '/admin-students' })
  },
})
