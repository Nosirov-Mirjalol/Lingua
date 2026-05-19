import { useMemo, useReducer, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { ArrowLeft, Plus, Search as SearchIcon, Trash2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { ChatEmptyState } from '@/components/shared/chat/chat-empty-state'
import { ChatListHeader } from '@/components/shared/chat/chat-list-header'
import { ChatListItem } from '@/components/shared/chat/chat-list-item'
import { NewChat } from '@/features/chats/components/new-chat'
import { useDeleteMessage, useGroupMessages, useMessageGroups, useSendMessage } from '@/hooks/useMessages'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

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

interface ChatState {
  selectedGroupId: number | null
  createConversationDialogOpened: boolean
  search: string
  chatSearch: string
  showChatSearch: boolean
}

type ChatAction =
  | { type: 'SELECT_GROUP'; payload: number | null }
  | { type: 'TOGGLE_NEW_CHAT'; payload: boolean }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CHAT_SEARCH'; payload: string }
  | { type: 'TOGGLE_CHAT_SEARCH' }

const initialState: ChatState = {
  selectedGroupId: null,
  createConversationDialogOpened: false,
  search: '',
  chatSearch: '',
  showChatSearch: false,
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SELECT_GROUP':
      return { ...state, selectedGroupId: action.payload }
    case 'TOGGLE_NEW_CHAT':
      return { ...state, createConversationDialogOpened: action.payload }
    case 'SET_SEARCH':
      return { ...state, search: action.payload }
    case 'SET_CHAT_SEARCH':
      return { ...state, chatSearch: action.payload }
    case 'TOGGLE_CHAT_SEARCH':
      return { ...state, showChatSearch: !state.showChatSearch, chatSearch: '' }
    default:
      return state
  }
}

interface MessageForm {
  content: string
}

export function MessagesPage() {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { selectedGroupId, createConversationDialogOpened, search, chatSearch, showChatSearch } = state
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  const { register, handleSubmit, reset, watch } = useForm<MessageForm>({
    defaultValues: { content: '' },
  })
  const contentValue = watch('content')

  const { data: groups = [], isLoading: groupsLoading, isError: groupsIsError } = useMessageGroups()
  const { data: messagesResp, isLoading: messagesLoading } = useGroupMessages(selectedGroupId ?? 0)
  const sendMutation = useSendMessage(selectedGroupId ?? 0)
  const deleteMutation = useDeleteMessage(selectedGroupId ?? 0)

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null

  const filteredGroups = useMemo(
    () => groups.filter((g) => g.name.toLowerCase().includes(search.trim().toLowerCase())),
    [groups, search]
  )

  const messages = useMemo(
    () =>
      [...(messagesResp?.results ?? [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [messagesResp]
  )

  const filteredMessages = useMemo(() => {
    if (!showChatSearch || !chatSearch.trim()) return messages
    return messages.filter((m) => m.content.toLowerCase().includes(chatSearch.trim().toLowerCase()))
  }, [chatSearch, messages, showChatSearch])

  const chatUsers = useMemo(
    () =>
      groups.map((g) => ({
        id: String(g.id),
        username: g.name.toLowerCase().replace(/\s+/g, '.'),
        fullName: g.name,
        profile: '/placeholder.svg',
        status: g.status.toLowerCase() === 'active' ? 'online' : 'offline',
      })) as any[],
    [groups]
  )

  const isOwnMessage = (msg: Message): boolean => {
    if (msg.is_own === true) return true
    try {
      const storageUser = localStorage.getItem('user')
      if (storageUser) {
        const loggedInUser = JSON.parse(storageUser)
        if (loggedInUser?.id && msg.sender?.id && Number(loggedInUser.id) === Number(msg.sender.id)) return true
        if (
          loggedInUser?.username &&
          msg.sender?.username &&
          loggedInUser.username.toLowerCase() === msg.sender.username.toLowerCase()
        )
          return true
      }
    } catch (error) {
      console.error('isOwnMessage mantiqida xatolik:', error)
    }
    return false
  }

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleStartChat = (selectedUsers: any[]) => {
    if (selectedUsers.length === 0) return
    const nextGroupId = Number(selectedUsers[0]?.id)
    if (!isNaN(nextGroupId)) dispatch({ type: 'SELECT_GROUP', payload: nextGroupId })
    dispatch({ type: 'TOGGLE_NEW_CHAT', payload: false })
  }

  const onSubmit = (data: MessageForm) => {
    if (!data.content.trim() || !selectedGroupId) return
    sendMutation.mutate({ content: data.content.trim() }, { onSuccess: () => reset() })
  }

  if (groupsIsError) {
    return (
      <div className='flex h-full min-h-[50vh] items-center justify-center text-slate-500'>
        Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.
      </div>
    )
  }

  return (
    <div className='mx-auto h-full w-full max-w-7xl p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-white/95'>
      <div className='flex h-[calc(100vh-8rem)] min-h-125 w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-950/40 backdrop-blur-md'>
        
        {/* Sidebar */}
        <div className={cn(
          'flex w-full flex-col border-r border-slate-100 bg-slate-50/40 dark:border-slate-800/60 dark:bg-transparent sm:w-80 lg:w-96', 
          selectedGroupId && 'hidden sm:flex'
        )}>
          {/* List Header va Inputlar uchun ota blok klasslariga tuzatish berildi */}
          <div className='flex-1 overflow-y-auto p-4 custom-chat-sidebar **:text-current'>
            <ChatListHeader
              title='Student Chat'
              count={groups.length}
              searchValue={search}
              onSearchChange={(val) => dispatch({ type: 'SET_SEARCH', payload: val })}
              searchPlaceholder='Qidirish...'
              action={
                <Button
                  type='button'
                  size='icon'
                  variant='ghost'
                  onClick={() => dispatch({ type: 'TOGGLE_NEW_CHAT', payload: true })}
                  className='rounded-full bg-slate-500/10 hover:bg-rose-500/20 text-current transition-colors'
                >
                  <Plus size={20} />
                </Button>
              }
            />

            {groupsLoading ? (
              <div className='mt-4 space-y-3'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-3 rounded-xl p-3 bg-slate-500/5'>
                    <Skeleton className='h-11 w-11 rounded-full bg-slate-500/10' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-1/2 bg-slate-500/10' />
                      <Skeleton className='h-3 w-3/4 bg-slate-500/10' />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredGroups.length > 0 ? (
              <div className='mt-4 space-y-1 [&_button]:bg-transparent [&_button:hover]:bg-slate-500/10 [&_button]:transition-all [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_p]:text-slate-500 dark:[&_p]:text-slate-400'>
                {filteredGroups.map((group) => (
                  <ChatListItem
                    key={group.id}
                    active={selectedGroupId === group.id}
                    fallback={group.name[0]?.toUpperCase() ?? 'G'}
                    title={group.name}
                    preview={group.last_message ? `${group.last_message.sender}: ${group.last_message.content}` : "Hali xabar yo'q"}
                    time={group.last_message ? format(new Date(group.last_message.created_at), 'HH:mm') : null}
                    online={group.status.toLowerCase() === 'active'}
                    onClick={() => dispatch({ type: 'SELECT_GROUP', payload: group.id })}
                  />
                ))}
              </div>
            ) : (
              <div className='mt-10 text-center text-sm font-medium opacity-50'>
                Guruhlar topilmadi
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          'flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#090d1f]/40', 
          !selectedGroupId && 'hidden sm:flex'
        )}>
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <div className='flex flex-col border-b border-slate-100 bg-white/50 px-5 py-4 dark:border-slate-800/60 dark:bg-transparent backdrop-blur-sm'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='-ml-2 shrink-0 md:hidden hover:bg-slate-500/10'
                      onClick={() => dispatch({ type: 'SELECT_GROUP', payload: null })}
                    >
                      <ArrowLeft className='h-5 w-5' />
                    </Button>

                    <div className='relative shrink-0'>
                      <Avatar className='h-11 w-11 border border-slate-200/50 dark:border-slate-800'>
                        <AvatarFallback className='bg-rose-500/10 font-bold text-rose-500'>
                          {selectedGroup.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {selectedGroup.status.toLowerCase() === 'active' && (
                        <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950' />
                      )}
                    </div>

                    <div className='min-w-0'>
                      <h2 className='truncate text-base font-bold text-slate-900 dark:text-white'>
                        {selectedGroup.name}
                      </h2>
                      <span className='text-xs font-semibold text-emerald-500 dark:text-emerald-400'>
                        {selectedGroup.status.toLowerCase() === 'active' ? 'Online' : selectedGroup.status}
                      </span>
                    </div>
                  </div>

                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    className='shrink-0 hover:bg-slate-500/10 opacity-70 hover:opacity-100'
                    onClick={() => dispatch({ type: 'TOGGLE_CHAT_SEARCH' })}
                  >
                    <SearchIcon size={20} />
                  </Button>
                </div>

                {showChatSearch && (
                  <div className='relative mt-4'>
                    <SearchIcon size={16} className='absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50' />
                    <input
                      type='text'
                      autoFocus
                      placeholder='Ushbu chatdan qidirish...'
                      className='h-10 w-full rounded-xl bg-slate-500/5 pl-10 pr-4 text-sm text-current outline-none transition-all border border-transparent focus:border-slate-500/20 focus:bg-slate-500/10'
                      value={chatSearch}
                      onChange={(e) => dispatch({ type: 'SET_CHAT_SEARCH', payload: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Messages List */}
              <div ref={messagesContainerRef} className='flex-1 overflow-y-auto bg-slate-500/2 p-4 sm:p-6'>
                <div className='flex flex-col gap-5'>
                  {messagesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={cn('flex flex-col gap-2', i % 2 === 0 ? 'items-end' : 'items-start')}>
                        <Skeleton className='h-12 w-56 rounded-2xl bg-slate-500/10' />
                      </div>
                    ))
                  ) : filteredMessages.length > 0 ? (
                    filteredMessages.map((msg, index) => {
                      const isOwn = isOwnMessage(msg)
                      const showSender = !isOwn && filteredMessages[index - 1]?.sender?.id !== msg.sender.id

                      return (
                        <div key={msg.id} className={cn('group flex max-w-[85%] sm:max-w-[75%] flex-col gap-1', isOwn ? 'items-end self-end' : 'items-start self-start')}>
                          {showSender && (
                            <span className='px-1 text-[11px] font-bold uppercase tracking-wider opacity-50'>
                              {msg.sender.full_name}
                            </span>
                          )}

                          <div className={cn('flex items-center gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
                            {isOwn && (
                              <Button
                                type='button'
                                size='icon'
                                variant='ghost'
                                onClick={() =>
                                  deleteMutation.mutate(
                                    { messageId: msg.id },
                                    { onSuccess: () => toast.success("Xabar o'chirildi") }
                                  )
                                }
                                className='h-8 w-8 shrink-0 rounded-xl text-rose-500 opacity-0 transition-all hover:bg-rose-500/10 group-hover:opacity-100'
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}

                            <div className={cn(
                              'px-4 py-2.5 text-[15px] leading-relaxed shadow-sm', 
                              isOwn 
                                ? 'rounded-2xl rounded-br-md bg-rose-600 text-white' 
                                : 'rounded-2xl rounded-bl-md border border-slate-200/60 bg-white text-slate-800 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-100'
                            )}>
                              {msg.message_type === 'image' && msg.image_url && (
                                <img src={msg.image_url} alt='Rasm' className='mb-2 max-w-xs rounded-xl object-cover' />
                              )}
                              {msg.message_type === 'file' && msg.file_url && (
                                <a href={msg.file_url} className={cn('mb-2 flex items-center gap-2 text-sm underline hover:opacity-80', isOwn ? 'text-rose-100' : 'text-slate-500 dark:text-slate-400')}>
                                  📎 Biriktirilgan fayl
                                </a>
                              )}
                              <p className='word-break-word'>{msg.content}</p>
                            </div>
                          </div>
                          <span className='px-1.5 text-[11px] font-medium opacity-40'>
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <div className='flex h-full items-center justify-center p-8 text-center text-sm font-medium opacity-40'>
                      Hali xabarlar yo'q
                    </div>
                  )}
                </div>
              </div>

              {/* Message Composer */}
              <div className='border-t border-slate-100 bg-white/50 p-3 dark:border-slate-800/60 dark:bg-transparent backdrop-blur-sm sm:p-4'>
                <form onSubmit={handleSubmit(onSubmit)} className='flex items-end gap-3'>
                  <textarea
                    rows={1}
                    placeholder='Xabar yozing...'
                    className='min-h-11 w-full flex-1 resize-none rounded-2xl border border-transparent bg-slate-500/5 px-4 py-3 text-sm text-current outline-none transition-all placeholder:opacity-50 focus:border-slate-500/20 focus:bg-slate-500/10'
                    {...register('content')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(onSubmit)()
                      }
                    }}
                  />
                  <Button
                    type='submit'
                    size='icon'
                    disabled={!contentValue?.trim() || sendMutation.isPending}
                    className='mb-0.5 h-10 w-10 shrink-0 rounded-xl bg-rose-600 text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-40'
                  >
                    <Send size={18} className='ml-0.5' />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State bloki to'liq dark-safe holatga keltirildi */
            <div className='flex h-full flex-col items-center justify-center bg-slate-500/1 dark:**:text-white/90 [&_.bg-white]:dark:bg-slate-900/40 [&_p]:dark:text-slate-400'>
              <ChatEmptyState
                title='Sizning xabarlaringiz'
                description='Suhbatlashish uchun chatni tanlang yoki yangisini yarating.'
                action={
                  <Button
                    type='button'
                    onClick={() => dispatch({ type: 'TOGGLE_NEW_CHAT', payload: true })}
                    className='mt-6 rounded-xl bg-rose-600 px-6 font-medium text-white transition-colors hover:bg-rose-700 border-none'
                  >
                    Xabar yuborish
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>

      <NewChat
        users={chatUsers}
        open={createConversationDialogOpened}
        onOpenChange={(val) => dispatch({ type: 'TOGGLE_NEW_CHAT', payload: val })}
        onStartChat={handleStartChat}
      />
    </div>
  )
}
