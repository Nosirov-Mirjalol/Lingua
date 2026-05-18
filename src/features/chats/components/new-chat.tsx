import { useState } from 'react'
import { Check, X } from 'lucide-react'
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

// MessagesPage bilan tip mos kelishi uchun ixtiyoriy maydonlarni ham qabul qiladigan qilamiz
type User = Partial<ChatUser> & {
  id: string
  username: string
  fullName: string
  profile?: string
  status?: string
}

type NewChatProps = {
  users: User[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartChat?: (users: User[]) => void
}

export function NewChat({
  users,
  onOpenChange,
  open,
  onStartChat,
}: NewChatProps) {
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
    if (!newOpen) setSelectedUsers([]) // Yopilganda tozalash
  }

  const handleStartChat = () => {
    if (selectedUsers.length === 0) return
    onStartChat?.(selectedUsers)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-150'>
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        
        <div className='flex flex-col gap-4'>
          {/* Selected Users Badges */}
          <div className='flex flex-wrap items-center gap-2 min-h-8'>
            <span className='text-sm text-muted-foreground mr-1'>To:</span>
            {selectedUsers.map((user) => (
              <Badge key={user.id} variant='default' className='gap-1 pr-1.5 py-1'>
                {user.fullName}
                <button
                  type='button'
                  className='rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors'
                  onClick={() => handleRemoveUser(user.id)}
                >
                  <X className='h-3 w-3 text-muted-foreground' />
                </button>
              </Badge>
            ))}
          </div>

          {/* Command Search & List */}
          <Command className='rounded-lg border border-slate-200 dark:border-slate-800'>
            <CommandInput placeholder='Search people...' className='text-foreground' />
            <CommandList>
              <CommandEmpty>No people found.</CommandEmpty>
              <CommandGroup heading='People'>
                <ScrollArea className='h-72'>
                  {users.map((user) => {
                    const isSelected = !!selectedUsers.find((u) => u.id === user.id)
                    
                    // Ism bosh harflarini xavfsiz olish (Crash tushmasligi uchun)
                    const initials = user.fullName
                      ? user.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase()
                      : 'U'

                    return (
                      <CommandItem
                        key={user.id}
                        onSelect={() => handleSelectUser(user)}
                        className='flex items-center justify-between gap-3 rounded-xl p-3 transition-all cursor-pointer'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='relative shrink-0'>
                            <Avatar className='h-10 w-10 border border-slate-100 shadow-sm'>
                              <AvatarImage src={user.profile || '/placeholder.svg'} alt={user.fullName} />
                              <AvatarFallback className='bg-rose-100 text-rose-700 font-semibold text-xs'>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            {user.status === 'online' && (
                              <span className='absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500' />
                            )}
                          </div>
                          
                          <div className='flex flex-col overflow-hidden'>
                            <span className='truncate text-sm font-bold text-slate-900 dark:text-white'>
                              {user.fullName}
                            </span>
                            <span className='truncate text-xs text-slate-500'>
                              @{user.username}
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className='flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white'>
                            <Check className='h-3.5 w-3.5 stroke-3' />
                          </div>
                        ) : (
                          <div className='h-5 w-5 rounded-full border-2 border-slate-200' />
                        )}
                      </CommandItem>
                    )
                  })}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>

          <Button
            type='button'
            variant='default'
            className='w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-5'
            onClick={handleStartChat}
            disabled={selectedUsers.length === 0}
          >
            Open Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}