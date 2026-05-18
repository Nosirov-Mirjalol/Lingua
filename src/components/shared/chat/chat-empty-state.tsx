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
<<<<<<< HEAD
    <div className='hidden flex-1 flex-col items-center justify-center rounded-3xl border bg-card shadow-xl shadow-border/50 md:flex'>
      <div className='flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary'>
        <MessagesSquare className='h-12 w-12' />
      </div>
      <h2 className='mt-6 text-xl font-bold text-foreground'>{title}</h2>
      <p className='mt-2 max-w-xs text-muted-foreground'>{description}</p>
      {action}
=======
    <div className='hidden flex-1 flex-col items-center justify-center rounded-3xl bg-transparent p-6 text-center md:flex'>
      {/* Icon wrapper - Ota blok fonida ajralib turishi uchun shaffof rose foni saqlandi */}
      <div className='flex h-24 w-24 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 transition-transform duration-300 hover:scale-105'>
        <MessagesSquare className='h-12 w-12' />
      </div>
      
      {/* Sarlavha - Dark va Light rejimga moslanuvchan */}
      <h2 className='mt-6 text-xl font-bold text-slate-900 dark:text-white/90'>
        {title}
      </h2>
      
      {/* Tavsif matni */}
      <p className='mt-2 max-w-xs text-sm font-medium text-slate-500 dark:text-slate-400/80'>
        {description}
      </p>
      
      {/* Tugma yoki qo'shimcha harakatlar */}
      <div className='mt-2'>
        {action}
      </div>
>>>>>>> b6612ff0a0c190d6006744c9e600144354c1074d
    </div>
  )
}