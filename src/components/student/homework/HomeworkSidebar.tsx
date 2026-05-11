import { Homework } from '@/types/student'
import { HomeworkSidebarItem } from './HomeworkSidebarItem'
import { Button } from '@/components/ui/button'
import { FilePlus } from 'lucide-react'

interface Props {
  homeworkList: Homework[]
  activeId: string | null
  onSelect: (id: string) => void
}

export function HomeworkSidebar({ homeworkList, activeId, onSelect }: Props) {
  return (
    <div className='w-[320px] border-r border-border flex flex-col h-full bg-background'>
      <div className='p-4 border-b border-border flex justify-between items-center'>
        <h2 className='font-bold text-lg'>Vazifalar</h2>
        <Button size='sm' variant='destructive'>
          <FilePlus size={16} className='mr-2' />
          New submission
        </Button>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {homeworkList.map((hw) => (
          <HomeworkSidebarItem
            key={hw.id}
            homework={hw}
            isActive={activeId === hw.id}
            onClick={() => onSelect(hw.id)}
          />
        ))}
      </div>
    </div>
  )
}
