import { Homework, HomeworkMessage } from '@/types/student'
import { HomeworkSidebar } from './HomeworkSidebar'
import { ChatBubble } from './ChatBubble'
import { HomeworkAssignmentBubble } from './HomeworkAssignmentBubble'
import { ChatInput } from './ChatInput'
import { useState } from 'react'

interface Props {
  homeworkList: Homework[]
  messages: HomeworkMessage[]
  onSendMessage: (text: string) => void
}

export function HomeworkChatArea({ homeworkList, messages, onSendMessage }: Props) {
  const [activeId, setActiveId] = useState<string | null>(homeworkList[0]?.id || null)
  const activeHomework = homeworkList.find((h) => h.id === activeId)

  return (
    <div className='flex h-screen bg-background'>
      <HomeworkSidebar homeworkList={homeworkList} activeId={activeId} onSelect={setActiveId} />
      <div className='flex-1 flex flex-col'>
        {activeHomework ? (
          <>
            <div className='flex-1 overflow-y-auto p-6'>
              <HomeworkAssignmentBubble homework={activeHomework} />
              {messages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
            </div>
            <ChatInput onSend={onSendMessage} />
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center text-muted-foreground'>
            Select a homework to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
