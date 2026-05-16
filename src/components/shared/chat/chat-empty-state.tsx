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
    <div className='hidden flex-1 flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 md:flex'>
      <div className='flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-rose-500'>
        <MessagesSquare className='h-12 w-12' />
      </div>
      <h2 className='mt-6 text-xl font-bold text-slate-900'>{title}</h2>
      <p className='mt-2 max-w-xs text-slate-500'>{description}</p>
      {action}
    </div>
  )
}
