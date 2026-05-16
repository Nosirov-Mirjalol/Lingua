import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/student/messages')({
  component: lazyRouteComponent(() => import('@/pages/MessagesPage'), 'MessagesPage'),
})
