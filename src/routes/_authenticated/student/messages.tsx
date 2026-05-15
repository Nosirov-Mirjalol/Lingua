import { createFileRoute } from '@tanstack/react-router'
import { MessagesPage } from '@/pages/MessagesPage'

export const Route = createFileRoute('/_authenticated/student/messages')({
  component: StudentMessagesPage,
})

function StudentMessagesPage() {
  return (
    <MessagesPage />
  )
}
