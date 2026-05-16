import type { ReactNode } from 'react'
import { Search as SearchIcon } from 'lucide-react'

type ChatListHeaderProps = {
  title: string
  count: number
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  action?: ReactNode
}

export function ChatListHeader({
  title,
  count,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  action,
}: ChatListHeaderProps) {
  return (
    <div className='flex flex-col gap-4 px-4 pt-4 md:px-0'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600'>
            {count}
          </div>
        </div>
        {action}
      </div>

      <div className='relative'>
        <SearchIcon
          size={16}
          className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400'
        />
        <input
          type='text'
          className='h-11 w-full rounded-xl border-none bg-slate-100 pl-10 pr-4 text-sm outline-none transition-all focus:bg-slate-200/50 focus:ring-2 focus:ring-rose-500/10'
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </div>
  )
}
