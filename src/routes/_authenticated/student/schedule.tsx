import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/student/schedule')({
  component: lazyRouteComponent(
    () => import('@/pages/student/schedule-page'),
    'StudentSchedulePage'
  ),
})
