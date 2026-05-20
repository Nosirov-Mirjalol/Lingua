import { type HomeworkMessage } from '@/types/student'
import { formatDisplayDate } from '@/lib/date-format'
import { cn } from '@/lib/utils'

interface Props {
  message: HomeworkMessage
}

export function ChatBubble({ message }: Props) {
  const isTeacher = message.senderRole === 'teacher'
  const formattedDate = formatDisplayDate(message.timestamp)

  return (
    <div className={cn('flex w-full mb-4', isTeacher ? 'justify-start' : 'justify-end')}>
      <div className={cn('max-w-[70%] p-3 rounded-2xl relative', isTeacher ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground')}>
        {isTeacher && <p className='text-xs font-bold mb-1'>{message.senderName}</p>}
        <p className='text-sm'>{message.content}</p>
        {formattedDate ? (
          <span className='mt-1 block text-right text-[10px] opacity-70'>
            {formattedDate}
          </span>
        ) : null}
      </div>
    </div>
  )
}
