import { createFileRoute } from '@tanstack/react-router'
import AssignmentsPage from '@/features/assignments'

export const Route = createFileRoute('/_authenticated/assignments/')({
  component: AssignmentsPage,
})
