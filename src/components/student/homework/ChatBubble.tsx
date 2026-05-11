import { HomeworkMessage } from '@/types/student'
import { cn } from '@/lib/utils'

interface Props {
  message: HomeworkMessage
}

export function ChatBubble({ message }: Props) {
  const isTeacher = message.senderRole === 'teacher'
  return (
    <div className={cn('flex w-full mb-4', isTeacher ? 'justify-start' : 'justify-end')}>
      <div className={cn('max-w-[70%] p-3 rounded-2xl relative', isTeacher ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground')}>
        {isTeacher && <p className='text-xs font-bold mb-1'>{message.senderName}</p>}
        <p className='text-sm'>{message.content}</p>
        <span className='text-[10px] opacity-70 block text-right mt-1'>{message.timestamp}</span>
      </div>
    </div>
  )
}
