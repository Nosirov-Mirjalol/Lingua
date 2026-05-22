import { createFileRoute } from '@tanstack/react-router'

import { MessagesPage } from '@/pages/MessagesPage'

export const Route = createFileRoute('/_authenticated/student/messages')({
  component: () => (
    <div className="h-full w-full [&>div]:!max-w-none [&>div]:!px-4">
      <MessagesPage />
    </div>
  ),
})
