import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/student/profile')({
  component: lazyRouteComponent(
    () => import('@/pages/student/profile-page'),
    'StudentProfilePage'
  ),
})
