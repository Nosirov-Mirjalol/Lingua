import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { GroupItem } from '@/components/messages/GroupItem'
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

export function GroupList({
  groups,
  isLoading,
  selectedGroupId,
  search,
  onSearchChange,
  onSelect,
}: {
  groups: MessageGroup[]
  isLoading: boolean
  selectedGroupId: number | null
  search: string
  onSearchChange: (value: string) => void
  onSelect: (groupId: number) => void
}) {
  return (
    <div className='flex h-full w-64 flex-col'>
      <div className='p-3'>
        <div className='relative'>
          <MSIcon
            name='search'
            className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Qidirish...'
            className='pl-10'
          />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-2 pb-2'>
        {isLoading ? (
          <div className='space-y-2'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className='h-16 w-full' />
            ))}
          </div>
        ) : (
          <div className='space-y-1'>
            {groups.map((g) => (
              <GroupItem
                key={g.id}
                group={g}
                isActive={selectedGroupId === g.id}
                onClick={() => onSelect(g.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
