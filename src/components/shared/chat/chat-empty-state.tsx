import type { ReactNode } from 'react'
import { MessagesSquare } from 'lucide-react'

type ChatEmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function ChatEmptyState({
  title,
  description,
  action,
}: ChatEmptyStateProps) {
  return (
    <div className='hidden flex-1 flex-col items-center justify-center rounded-3xl border bg-card shadow-xl shadow-border/50 md:flex'>
      <div className='flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary'>
        <MessagesSquare className='h-12 w-12' />
      </div>
      <h2 className='mt-6 text-xl font-bold text-foreground'>{title}</h2>
      <p className='mt-2 max-w-xs text-muted-foreground'>{description}</p>
      {action}
    </div>
  )
}
