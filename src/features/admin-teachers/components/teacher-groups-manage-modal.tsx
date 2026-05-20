import { UsersIcon, Trash2, Plus } from 'lucide-react'
import type { Group } from '@/api/service/teacher/group.type'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TeacherGroupsManageModalProps {
  isOpen: boolean
  onClose: () => void
  teacherName: string
  groups: Group[]
  onAddGroup: () => void
  onDeleteGroup: (groupId: number) => void
}

export function TeacherGroupsManageModal({
  isOpen,
  onClose,
  teacherName,
  groups,
  onAddGroup,
  onDeleteGroup,
}: TeacherGroupsManageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>
            Guruhlar - {teacherName}
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          {groups.length === 0 ? (
            <div className='py-8 text-center text-sm text-muted-foreground'>
              Guruhlar yo'q
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className='flex items-center justify-between rounded-lg border bg-card p-3'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <UsersIcon className='h-4 w-4' />
                  </div>
                  <div>
                    <div className='text-sm font-bold text-foreground'>
                      {group.name}
                    </div>
                    <div className='text-[10px] text-muted-foreground'>
                      {group.students?.length || 0} talaba
                    </div>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 rounded-full text-destructive hover:bg-destructive/10'
                  onClick={() => onDeleteGroup(group.id)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))
          )}
        </div>
        <div className='flex justify-end gap-2 pt-4'>
          <Button
            variant='outline'
            onClick={onClose}
            className='rounded-full'
          >
            Yopish
          </Button>
          <Button
            onClick={onAddGroup}
            className='rounded-full bg-primary text-white hover:bg-primary/90'
          >
            <Plus className='mr-2 h-4 w-4' /> Guruh qo'shish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
