import { useMemo, useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { ArrowLeft, Plus, Search as SearchIcon, Trash2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { ChatEmptyState } from '@/components/shared/chat/chat-empty-state'
import { ChatListHeader } from '@/components/shared/chat/chat-list-header'
import { ChatListItem } from '@/components/shared/chat/chat-list-item'
import { NewChat } from '@/features/chats/components/new-chat'
import { useDeleteMessage, useGroupMessages, useMessageGroups, useSendMessage } from '@/hooks/useMessages'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

// Types
export interface MessageSender {
  id: number
  username: string
  full_name: string
  role: 'admin' | 'teacher' | 'student'
}

export interface Message {
  id: number
  group: number
  sender: MessageSender
  content: string
  message_type: 'text' | 'file' | 'image'
  file_url: string | null
  image_url: string | null
  is_own?: boolean
  created_at: string
}

export function MessagesPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [createConversationDialogOpened, setCreateConversationDialog] = useState(false)
  const [search, setSearch] = useState('')
  const [chatSearch, setChatSearch] = useState('')
  const [showChatSearch, setShowChatSearch] = useState(false)
  const [messageText, setMessageText] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  // API Hooks
  const { data: groups = [], isLoading: groupsLoading, isError: groupsIsError } = useMessageGroups()
  const { data: messagesResp, isLoading: messagesLoading } = useGroupMessages(selectedGroupId ?? 0)
  const sendMutation = useSendMessage(selectedGroupId ?? 0)
  const deleteMutation = useDeleteMessage(selectedGroupId ?? 0)

  // Selectors & Filters
  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null

  const filteredGroups = useMemo(() => 
    groups.filter((g) => g.name.toLowerCase().includes(search.trim().toLowerCase())),
    [groups, search]
  )

  const messages = useMemo(() => 
    [...(messagesResp?.results ?? [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
    [messagesResp]
  )

  const filteredMessages = useMemo(() => {
    if (!showChatSearch || !chatSearch.trim()) return messages
    return messages.filter((m) => m.content.toLowerCase().includes(chatSearch.trim().toLowerCase()))
  }, [chatSearch, messages, showChatSearch])

  // NewChat dialogi uchun foydalanuvchilar ro'yxati
  const chatUsers = useMemo(() => 
    groups.map((g) => ({
      id: String(g.id),
      username: g.name.toLowerCase().replace(/\s+/g, '.'),
      fullName: g.name,
      profile: '/placeholder.svg',
      status: g.status.toLowerCase() === 'active' ? 'online' : 'offline',
    })) as any[],
    [groups]
  )

  // LocalStorage asosida xabar egasini tekshirish funksiyasi
  const isOwnMessage = (msg: Message): boolean => {
    if (msg.is_own === true) return true

    try {
      const storageUser = localStorage.getItem('user')
      if (storageUser) {
        const loggedInUser = JSON.parse(storageUser)
        
        // ID bo'yicha tekshirish (Skrinshotdagi user.id: 8)
        if (loggedInUser?.id && msg.sender?.id && Number(loggedInUser.id) === Number(msg.sender.id)) {
          return true
        }
        
        // Zaxira: Username bo'yicha tekshirish
        if (loggedInUser?.username && msg.sender?.username && 
            loggedInUser.username.toLowerCase() === msg.sender.username.toLowerCase()) {
          return true
        }
      }
    } catch (error) {
      console.error("isOwnMessage mantiqida xatolik:", error)
    }

    return false
  }

  // Scroll to bottom
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  // Yangi chat boshlash (NewChat component uchun)
  const handleStartChat = (selectedUsers: any[]) => {
    if (selectedUsers.length === 0) return
    const nextGroupId = Number(selectedUsers[0]?.id)
    if (!isNaN(nextGroupId)) {
      setSelectedGroupId(nextGroupId)
    }
    setCreateConversationDialog(false)
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedGroupId) return

    sendMutation.mutate(
      { content: messageText.trim() },
      {
        onSuccess: () => {
          setMessageText('')
        },
      }
    )
  }

  if (groupsIsError) {
    return (
      <div className='flex h-full items-center justify-center text-slate-500'>
        Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-7xl p-4'>
      <div className='flex h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#020617]'>
        
        {/* Sidebar */}
        <div className={cn('flex w-full flex-col border-r border-slate-100 dark:border-slate-800 sm:w-80 lg:w-96', selectedGroupId && 'hidden sm:flex')}>
          <div className='flex-1 overflow-y-auto p-3'>
            <ChatListHeader
              title='Student Chat'
              count={groups.length}
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder='Search...'
              action={
                <Button size='icon' variant='ghost' onClick={() => setCreateConversationDialog(true)} className='rounded-full bg-slate-100 hover:bg-rose-100'>
                  <Plus size={20} />
                </Button>
              }
            />

            {groupsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex items-center gap-3 p-3'>
                  <Skeleton className='h-10 w-10 rounded-xl' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-1/2' />
                    <Skeleton className='h-3 w-3/4' />
                  </div>
                </div>
              ))
            ) : filteredGroups.length > 0 ? (
              <div className='space-y-1'>
                {filteredGroups.map((group) => (
                  <ChatListItem
                    key={group.id}
                    active={selectedGroupId === group.id}
                    fallback={group.name[0]?.toUpperCase() ?? 'G'}
                    title={group.name}
                    preview={group.last_message ? `${group.last_message.sender}: ${group.last_message.content}` : "Hali xabar yo'q"}
                    time={group.last_message ? format(new Date(group.last_message.created_at), 'HH:mm') : null}
                    online={group.status.toLowerCase() === 'active'}
                    onClick={() => setSelectedGroupId(group.id)}
                  />
                ))}
              </div>
            ) : (
              <div className='p-6 text-center text-sm text-slate-400'>Guruhlar topilmadi</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn('flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#020617]', !selectedGroupId && 'hidden sm:flex')}>
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <div className='flex flex-col border-b border-slate-100 dark:border-slate-800 px-6 py-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='icon' className='md:hidden' onClick={() => setSelectedGroupId(null)}>
                      <ArrowLeft className='h-5 w-5' />
                    </Button>

                    <div className='relative'>
                      <Avatar className='h-10 w-10'>
                        <AvatarFallback className='bg-rose-100 text-rose-700'>{selectedGroup.name[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {selectedGroup.status.toLowerCase() === 'active' && (
                        <span className='absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500' />
                      )}
                    </div>

                    <div>
                      <h2 className='text-base font-bold text-slate-900 dark:text-white'>{selectedGroup.name}</h2>
                      <span className='text-xs text-green-500'>{selectedGroup.status.toLowerCase() === 'active' ? 'Online' : selectedGroup.status}</span>
                    </div>
                  </div>

                  <Button size='icon' variant='ghost' className='text-slate-400' onClick={() => setShowChatSearch(!showChatSearch)}>
                    <SearchIcon size={20} />
                  </Button>
                </div>

                {showChatSearch && (
                  <div className='mt-3 relative'>
                    <SearchIcon size={14} className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400' />
                    <input
                      type='text'
                      autoFocus
                      placeholder='Search in this chat...'
                      className='h-9 w-full rounded-lg bg-slate-100 pl-9 pr-4 text-sm outline-none dark:bg-slate-900'
                      value={chatSearch}
                      onChange={(e) => setChatSearch(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Messages List */}
              <div ref={messagesContainerRef} className='flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/10 p-4 sm:p-6'>
                <div className='flex flex-col gap-4'>
                  {messagesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={cn('flex flex-col gap-2', i % 2 === 0 ? 'items-end' : 'items-start')}>
                        <Skeleton className='h-9 w-48 rounded-xl' />
                      </div>
                    ))
                  ) : filteredMessages.length > 0 ? (
                    filteredMessages.map((msg, index) => {
                      const isOwn = isOwnMessage(msg)
                      const showSender = !isOwn && filteredMessages[index - 1]?.sender?.id !== msg.sender.id

                      return (
                        <div key={msg.id} className={cn('group flex max-w-[80%] flex-col gap-1', isOwn ? 'items-end self-end' : 'items-start self-start')}>
                          {showSender && <span className='text-[10px] font-bold text-slate-400 uppercase'>{msg.sender.full_name}</span>}
                          
                          <div className={cn('flex items-center gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
                            {isOwn && (
                              <Button
                                size='icon'
                                variant='ghost'
                                onClick={() => deleteMutation.mutate({ messageId: msg.id }, { onSuccess: () => toast.success("Xabar o'chirildi") })}
                                className='h-8 w-8 rounded-xl opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-100 text-rose-600'
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                            
                            <div className={cn('rounded-2xl px-4 py-2 text-sm shadow-sm', isOwn ? 'bg-rose-600 text-white rounded-br-none' : 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-bl-none')}>
                              {msg.message_type === 'image' && msg.image_url && <img src={msg.image_url} alt='Rasm' className='mb-2 max-w-xs rounded-lg' />}
                              {msg.message_type === 'file' && msg.file_url && (
                                <a href={msg.file_url} className='mb-2 flex items-center gap-2 underline text-xs'>📎 Fayl</a>
                              )}
                              <p className='leading-relaxed'>{msg.content}</p>
                            </div>
                          </div>
                          <span className='text-[10px] text-slate-400 px-1'>{format(new Date(msg.created_at), 'HH:mm')}</span>
                        </div>
                      )
                    })
                  ) : (
                    <div className='text-center text-slate-400 p-8'>Hali xabarlar yo'q</div>
                  )}
                </div>
              </div>

              {/* Message Composer */}
              <div className='border-t border-slate-100 dark:border-slate-800 p-4'>
                <form onSubmit={handleSend} className='flex items-center gap-3'>
                  <textarea
                    rows={1}
                    placeholder='Xabar yozing...'
                    className='flex-1 resize-none rounded-xl bg-slate-100/80 dark:bg-slate-900 px-4 py-2.5 text-sm outline-none focus:bg-white dark:focus:bg-slate-950 border border-transparent focus:border-slate-200 dark:focus:border-slate-800'
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend(e)
                      }
                    }}
                  />
                  <Button
                    type='submit'
                    size='icon'
                    disabled={!messageText.trim() || sendMutation.isPending}
                    className='h-10 w-10 rounded-xl bg-rose-600 text-white hover:bg-rose-700 shrink-0'
                  >
                    <Send size={16} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <ChatEmptyState
              title='Your messages'
              description='Select a chat to start messaging or create a new one.'
              action={
                <Button onClick={() => setCreateConversationDialog(true)} className='mt-6 rounded-xl bg-rose-600 hover:bg-rose-700 px-6'>
                  Send Message
                </Button>
              }
            />
          )}
        </div>
      </div>

      <NewChat
        users={chatUsers}
        open={createConversationDialogOpened}
        onOpenChange={setCreateConversationDialog}
        onStartChat={handleStartChat}
      />
    </div>
  )
}