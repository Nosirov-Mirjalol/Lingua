import { createFileRoute } from '@tanstack/react-router'
import TeachersPage from '@/features/teachers'

export const Route = createFileRoute('/_authenticated/teachers/')({
  component: TeachersPage,
})
