import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type ChatListItemProps = {
  active?: boolean
  avatar?: string | null
  fallback: string
  title: string
  preview: string
  time?: string | null
  online?: boolean
  onClick: () => void
}

export function ChatListItem({
  active = false,
  avatar,
  fallback,
  title,
  preview,
  time,
  online = false,
  onClick,
}: ChatListItemProps) {
  return (
    <button
      type='button'
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-all duration-200',
        active
          ? 'border-rose-500 bg-primary/10 shadow-sm ring-1 ring-primary/20'
          : 'border-rose-300 hover:bg-muted'
      )}
      onClick={onClick}
    >
      <div className='relative flex-shrink:0'>
        <Avatar className='h-12 w-12 border-2 border-background shadow-sm'>
          {avatar ? <AvatarImage src={avatar} alt={title} /> : null}
          <AvatarFallback className='bg-primary/10 font-semibold text-primary'>
            {fallback}
          </AvatarFallback>
        </Avatar>
        {online ? (
          <span className='absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-500' />
        ) : null}
      </div>

      <div className='flex flex-1 flex-col overflow-hidden'>
        <div className='flex items-center justify-between gap-2'>
          <span
            className={cn(
              'truncate font-semibold text-foreground',
              active && 'text-primary'
            )}
          >
            {title}
          </span>
          {time ? (
            <span className='text-[11px] text-muted-foreground'>{time}</span>
          ) : null}
        </div>
        <span
          className={cn(
            'line-clamp-1 text-sm text-muted-foreground transition-colors',
            active ? 'text-primary/70' : 'group-hover:text-foreground'
          )}
        >
          {preview}
        </span>
      </div>

      {active ? (
        <div className='absolute top-1/2 right-0 h-8 w-1 -translate-y-1/2 rounded-l-full bg-primary' />
      ) : null}
    </button>
  )
}
