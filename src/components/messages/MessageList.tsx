import { Fragment, useEffect, useMemo, useRef } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageBubble } from '@/components/messages/MessageBubble'
import { cn } from '@/lib/utils'
import type { Message } from '@/types/messages'

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatDayLabel(d: Date): string {
  return d.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })
}

export function MessageList({
  messages,
  isLoading,
  currentUserId,
  onDeleteMessage,
}: {
  messages: Message[]
  isLoading: boolean
  currentUserId: number
  onDeleteMessage: (messageId: number) => void
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const sorted = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sorted.length])

  if (isLoading) {
    return (
      <div className='flex-1 space-y-3 overflow-y-auto p-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}
          >
            <Skeleton className='h-10 w-64 rounded-2xl' />
          </div>
        ))}
      </div>
    )
  }

  if (!sorted.length) {
    return (
      <div className='flex flex-1 items-center justify-center p-4'>
        <div className='text-center text-sm text-muted-foreground'>Hali xabar yo&apos;q</div>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-y-auto p-4'>
      <div className='space-y-3'>
        {sorted.map((m, idx) => {
          const prev = idx > 0 ? sorted[idx - 1] : null
          const d = new Date(m.created_at)
          const prevDate = prev ? new Date(prev.created_at) : null
          const showDivider = !prevDate || !isSameDay(d, prevDate)

          const isOwn = m.sender?.id === currentUserId
          const showSender = !isOwn && (!prev || prev.sender.id !== m.sender.id)

          return (
            <Fragment key={m.id}>
              {showDivider ? (
                <div className='flex items-center justify-center py-2'>
                  <div className='rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground'>
                    {formatDayLabel(d)}
                  </div>
                </div>
              ) : null}

              <MessageBubble
                message={m}
                isOwn={isOwn}
                showSender={showSender}
                onDelete={() => onDeleteMessage(m.id)}
              />
            </Fragment>
          )
        })}
      </div>

      <div ref={bottomRef} />
    </div>
  )
}
