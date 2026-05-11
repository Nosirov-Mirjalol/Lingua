import type { Message } from '@/types/messages'
import { cn } from '@/lib/utils'

function MSIcon({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden='true'
      className={`material-symbols-rounded ${className ?? ''}`}
    >
      {name}
    </span>
  )
}

function getFileNameFromUrl(url: string): string {
  try {
    const last = url.split('/').pop() ?? ''
    return decodeURIComponent(last) || 'file'
  } catch {
    return 'file'
  }
}

export function MessageBubble({
  message,
  isOwn,
  showSender,
  onDelete,
}: {
  message: Message
  isOwn: boolean
  showSender: boolean
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        'group flex w-full',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div className={cn('max-w-xl', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && showSender ? (
          <div className='mb-1 text-xs font-medium text-muted-foreground'>
            {message.sender.full_name}
          </div>
        ) : null}

        <div
          className={cn(
            'relative rounded-2xl px-4 py-2 text-sm',
            isOwn
              ? 'lp-primary-bg text-white'
              : 'border bg-background text-foreground'
          )}
        >
          {message.message_type === 'image' && message.image_url ? (
            <img
              src={message.image_url}
              alt='message'
              className='max-w-xs rounded-lg'
            />
          ) : null}

          {message.message_type === 'file' && message.file_url ? (
            <a
              href={message.file_url}
              className={cn(
                'flex items-center gap-2 underline underline-offset-4',
                isOwn ? 'text-white' : 'text-foreground'
              )}
            >
              <MSIcon name='download' />
              {getFileNameFromUrl(message.file_url)}
            </a>
          ) : null}

          {message.message_type === 'text' ? (
            <div className='wrap-break-word whitespace-pre-wrap'>
              {message.content}
            </div>
          ) : null}

          {isOwn ? (
            <button
              type='button'
              aria-label="O'chirish"
              onClick={onDelete}
              className={cn(
                'absolute top-1/2 -right-10 -translate-y-1/2',
                'hidden rounded-md p-2 text-muted-foreground group-hover:block hover:bg-muted'
              )}
            >
              <MSIcon name='delete' />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
