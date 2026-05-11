import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type ChatUser } from '../data/chat-types'

type User = Omit<ChatUser, 'messages'>

type NewChatProps = {
  users: User[]
  open: boolean
  onOpenChange: (open: boolean) => void
}
export function NewChat({ users, onOpenChange, open }: NewChatProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    } else {
      handleRemoveUser(user.id)
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    // Reset selected users when dialog closes
    if (!newOpen) {
      setSelectedUsers([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-baseline-last gap-2'>
            <span className='min-h-6 text-sm text-muted-foreground'>To:</span>
            {selectedUsers.map((user) => (
              <Badge key={user.id} variant='default'>
                {user.fullName}
                <button
                  className='ms-1 rounded-full ring-offset-background outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRemoveUser(user.id)
                    }
                  }}
                  onClick={() => handleRemoveUser(user.id)}
                >
                  <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                </button>
              </Badge>
            ))}
          </div>
          <Command className='rounded-lg border'>
            <CommandInput
              placeholder='Search people...'
              className='text-foreground'
            />
            <CommandList>
              <CommandEmpty>No people found.</CommandEmpty>
            <CommandGroup heading='People'>
              <ScrollArea className='h-72'>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleSelectUser(user)}
                    className='flex items-center justify-between gap-3 rounded-xl p-3 transition-all hover:bg-rose-50'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='relative'>
                        <Avatar className='h-10 w-10 border border-slate-100 shadow-sm'>
                          <AvatarImage src={user.profile || '/placeholder.svg'} alt={user.fullName} />
                          <AvatarFallback className='bg-rose-100 text-rose-700 font-semibold'>
                            {user.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {user.status === 'online' && (
                          <span className='absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500' />
                        )}
                      </div>
                      <div className='flex flex-col overflow-hidden'>
                        <span className='truncate text-sm font-bold text-slate-900'>
                          {user.fullName}
                        </span>
                        <span className='truncate text-xs text-slate-500'>
                          @{user.username}
                        </span>
                      </div>
                    </div>

                    {selectedUsers.find((u) => u.id === user.id) ? (
                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white'>
                        <Check className='h-4 w-4 stroke-[3]' />
                      </div>
                    ) : (
                      <div className='h-6 w-6 rounded-full border-2 border-slate-200 group-hover:border-rose-300' />
                    )}
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
            </CommandList>
          </Command>
          <Button
            variant={'default'}
            onClick={() => showSubmittedData(selectedUsers)}
            disabled={selectedUsers.length === 0}
          >
            Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
