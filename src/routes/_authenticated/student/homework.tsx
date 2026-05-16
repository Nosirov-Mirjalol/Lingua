import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/student/homework')({
  component: lazyRouteComponent(() => import('@/pages/student/homework-page')),
})
