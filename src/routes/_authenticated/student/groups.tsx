import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/student/groups')({
  component: lazyRouteComponent(
    () => import('@/pages/student/groups-page'),
    'StudentGroupsPage'
  ),
})
