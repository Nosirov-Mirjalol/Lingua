import { Homework } from '@/types/student'
import { HomeworkStatusBadge } from './HomeworkStatusBadge'
import { cn } from '@/lib/utils'
import { User, Calendar } from 'lucide-react'

interface Props {
  homework: Homework
  isActive: boolean
  onClick: () => void
}

export function HomeworkSidebarItem({ homework, isActive, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer p-4 border-b border-border transition-colors hover:bg-muted/50',
        isActive && 'bg-primary/10 border-l-4 border-l-primary'
      )}
    >
      <div className='flex justify-between items-start mb-1'>
        <h4 className='font-bold text-sm'>{homework.title}</h4>
        <HomeworkStatusBadge status={homework.status} />
      </div>
      <p className='text-xs text-muted-foreground'>{homework.groupName}</p>
      <div className='flex items-center text-xs text-muted-foreground mt-1'>
        <User size={12} className='mr-1' />
        {homework.teacherName}
      </div>
      <div className='flex items-center text-xs text-muted-foreground mt-1'>
        <Calendar size={12} className='mr-1' />
        Due {homework.dueDate}
      </div>
    </div>
  )
}
