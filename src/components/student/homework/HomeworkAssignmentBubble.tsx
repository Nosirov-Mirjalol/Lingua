import { Homework } from '@/types/student'
import { Book, Calendar } from 'lucide-react'

interface Props {
  homework: Homework
}

export function HomeworkAssignmentBubble({ homework }: Props) {
  return (
    <div className='bg-muted p-4 rounded-2xl w-[80%] my-4 border border-border'>
      <div className='flex items-center text-red-500 mb-2'>
        <Book size={16} className='mr-2' />
        <span className='text-xs font-bold uppercase'>VAZIFA</span>
      </div>
      <h3 className='font-bold text-base mb-1'>{homework.title}</h3>
      <p className='text-xs text-muted-foreground mb-2'>{homework.groupName}</p>
      <div className='flex items-center text-xs text-muted-foreground mb-4'>
        <Calendar size={14} className='mr-2' />
        {homework.dueDate}
      </div>
      <p className='text-sm mb-4'>{homework.description}</p>
      <ul className='list-disc list-inside text-sm'>
        {homework.requirements.map((req, i) => (
          <li key={i}>{req}</li>
        ))}
      </ul>
    </div>
  )
}
