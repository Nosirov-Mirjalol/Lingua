import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/teacher-dashboard/settings'
)({
  beforeLoad: () => {
    throw redirect({ to: '/teacher-dashboard' })
  },
  component: () => null,
})
