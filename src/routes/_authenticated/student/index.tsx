import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/student/')({
  component: lazyRouteComponent(
    () => import('@/pages/student/overview-page'),
    'StudentOverviewPage'
  ),
})
