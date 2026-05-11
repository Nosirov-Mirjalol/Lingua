import { cn } from '@/lib/utils'
import type { MessageGroup } from '@/types/messages'

function formatLastMessageTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()

  if (sameDay) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()

  if (isYesterday) return 'Kecha'

  return d.toLocaleDateString()
}

export function GroupItem({
  group,
  isActive,
  onClick,
}: {
  group: MessageGroup
  isActive: boolean
  onClick: () => void
}) {
  const lastContent = group.last_message?.content ?? ''
  const lastTime = group.last_message?.created_at
    ? formatLastMessageTime(group.last_message.created_at)
    : ''

  return (
    <button
      type='button'
      aria-label={`Guruh: ${group.name}`}
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-md px-3 py-3 transition-colors',
        'hover:bg-muted',
        isActive && 'bg-muted border-l-2 lp-primary-border rounded-l-none'
      )}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <div className='truncate text-sm font-medium text-foreground'>
            {group.name}
          </div>
          <div className='truncate text-xs text-muted-foreground'>
            {lastContent}
          </div>
        </div>

        <div className='flex flex-col items-end gap-2'>
          <div className='text-xs text-muted-foreground'>{lastTime}</div>

          {group.unread_count > 0 ? (
            <div className='lp-primary-bg rounded-full px-2 py-1 text-xs font-semibold text-white'>
              {group.unread_count}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  )
}
