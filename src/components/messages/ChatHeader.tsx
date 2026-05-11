import type { MessageGroup } from '@/types/messages'

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

export function ChatHeader({ group }: { group: MessageGroup }) {
  return (
    <div className='flex items-center justify-between border-b bg-background px-4 py-3'>
      <div className='min-w-0'>
        <div className='truncate text-base font-semibold text-foreground'>
          {group.name}
        </div>
        <div className='text-xs text-muted-foreground'>{group.status}</div>
      </div>

      <div className='flex items-center gap-2 text-muted-foreground'>
        <MSIcon name='chat' />
      </div>
    </div>
  )
}
