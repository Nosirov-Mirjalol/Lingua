import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/teacher-dashboard/groups'
)({
  component: GroupsLayout,
})

function GroupsLayout() {
  return <Outlet />
}
