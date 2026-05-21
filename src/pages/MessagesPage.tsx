import { useMemo, useReducer, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { ArrowLeft, Plus, Search as SearchIcon, Trash2, Send, ChevronRight, ChevronLeft } from 'lucide-react'
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
  sidebarCollapsed: boolean
}

type ChatAction =
  | { type: 'SELECT_GROUP'; payload: number | null }
  | { type: 'TOGGLE_NEW_CHAT'; payload: boolean }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CHAT_SEARCH'; payload: string }
  | { type: 'TOGGLE_CHAT_SEARCH' }
  | { type: 'TOGGLE_SIDEBAR' }

const initialState: ChatState = {
  selectedGroupId: null,
  createConversationDialogOpened: false,
  search: '',
  chatSearch: '',
  showChatSearch: false,
  sidebarCollapsed: false,
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
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed }
    default:
      return state
  }
}

interface MessageForm {
  content: string
}

export function MessagesPage() {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { selectedGroupId, createConversationDialogOpened, search, chatSearch, showChatSearch, sidebarCollapsed } = state
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
    // ✅ FIX 1: lg:px-12 → lg:px-2 — katta padding chatni siqib qo'yardi
    <div className='mx-auto h-full w-full max-w-full p-2 sm:p-3 lg:px-2 lg:py-2 text-slate-900 dark:text-white/95'>
      <div className='flex h-[calc(100dvh-4.5rem)] sm:h-[calc(100dvh-6rem)] lg:h-[calc(100dvh-4.5rem)] min-h-[500px] w-full overflow-hidden rounded-2xl border border-primary/20 transition-all hover:border-primary/30 hover:shadow-md bg-white shadow-sm dark:bg-slate-950/40 backdrop-blur-md'>

        {/* SIDEBAR */}
        {/* ✅ FIX 2: lg:w-80 xl:w-96 → lg:w-60 xl:w-64 — sidebar kengligi kamaytirildi */}
        <div className={cn(
          'flex flex-col border-r border-slate-100 bg-slate-50/40 dark:border-slate-800/60 dark:bg-transparent shrink-0 transition-all duration-300 ease-in-out relative',
          sidebarCollapsed
            ? 'w-[52px] sm:w-[56px]'
            : 'w-full sm:w-52 md:w-56 lg:w-60 xl:w-64',
          selectedGroupId ? 'hidden sm:flex' : 'flex'
        )}>
          {/* Collapsed: show only avatars */}
          {sidebarCollapsed ? (
            <div className='flex flex-col items-center gap-2 p-2 flex-1 overflow-y-auto'>
              {/* Toggle button at top */}
              <button
                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                className='flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors mt-1 mb-1'
                title='Sidebar ochish'
              >
                <ChevronRight size={18} />
              </button>

              {/* Plus button */}
              <button
                onClick={() => dispatch({ type: 'TOGGLE_NEW_CHAT', payload: true })}
                className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors mb-1'
                title="Yangi suhbat"
              >
                <Plus size={18} />
              </button>

              {/* Group avatars (icon-only list) */}
              {groupsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className='h-10 w-10 rounded-full bg-slate-500/10' />
                ))
              ) : (
                filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => dispatch({ type: 'SELECT_GROUP', payload: group.id })}
                    title={group.name}
                    className={cn(
                      'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-105',
                      selectedGroupId === group.id
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent bg-slate-200/60 dark:bg-slate-800/60 hover:border-primary/40'
                    )}
                  >
                    <span className='text-[13px] font-bold text-primary'>
                      {group.name[0]?.toUpperCase() ?? 'G'}
                    </span>
                    {group.status.toLowerCase() === 'active' && (
                      <span className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950' />
                    )}
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Expanded sidebar */
            <>
              <div className='flex-1 min-h-0 overflow-y-auto p-3 sm:p-3 custom-chat-sidebar'>
                <ChatListHeader
                  title='Xabarlar'
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
                      className='rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors'
                    >
                      <Plus size={20} />
                    </Button>
                  }
                />

                {groupsLoading ? (
                  <div className='mt-4 space-y-3'>
                    {Array.from({ length: 6 }).map((_, i) => (
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
                  <div className='mt-4 space-y-1.5 [&_button]:bg-transparent [&_button:hover]:bg-slate-500/10 [&_button]:transition-all [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_p]:text-slate-500 dark:[&_p]:text-slate-400'>
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

              {/* Collapse toggle button at bottom of expanded sidebar */}
              <div className='border-t border-slate-100 dark:border-slate-800/60 p-2 flex justify-end'>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                  className='flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-600 dark:hover:text-slate-300 transition-colors'
                  title='Sidebar yopish'
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* CHAT MAIN AREA */}
        {/* ✅ FIX 3: w-0 qo'shildi — flex-1 bilan birga to'liq kenglikni egallaydi */}
        <div className={cn(
          'flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#090d1f]/40 min-w-0 w-0',
          !selectedGroupId ? 'hidden sm:flex' : 'flex'
        )}>
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <div className='flex flex-col border-b border-slate-100 bg-white/50 px-3 py-2.5 dark:border-slate-800/60 dark:bg-transparent backdrop-blur-sm sm:px-4 sm:py-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='-ml-1 shrink-0 sm:hidden hover:bg-slate-500/10'
                      onClick={() => dispatch({ type: 'SELECT_GROUP', payload: null })}
                    >
                      <ArrowLeft className='h-5 w-5' />
                    </Button>

                    <div className='relative shrink-0'>
                      <Avatar className='h-9 w-9 border border-slate-200/50 dark:border-slate-800 sm:h-10 sm:w-10'>
                        <AvatarFallback className='bg-primary/10 font-bold text-primary text-sm'>
                          {selectedGroup.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {selectedGroup.status.toLowerCase() === 'active' && (
                        <span className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950 sm:h-3 sm:w-3' />
                      )}
                    </div>

                    <div className='min-w-0'>
                      <h2 className='truncate text-sm font-bold text-slate-900 dark:text-white'>
                        {selectedGroup.name}
                      </h2>
                      <span className='text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 sm:text-xs'>
                        {selectedGroup.status.toLowerCase() === 'active' ? 'Online' : 'Offline'}
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
                    <SearchIcon size={18} />
                  </Button>
                </div>

                {showChatSearch && (
                  <div className='relative mt-2.5 sm:mt-3'>
                    <SearchIcon size={15} className='absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50' />
                    <input
                      type='text'
                      autoFocus
                      placeholder='Ushbu chatdan qidirish...'
                      className='h-9 w-full rounded-xl bg-slate-500/5 pl-9 pr-4 text-sm text-current outline-none transition-all border border-transparent focus:border-slate-500/20 focus:bg-slate-500/10'
                      value={chatSearch}
                      onChange={(e) => dispatch({ type: 'SET_CHAT_SEARCH', payload: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                className='flex-1 min-h-0 overflow-y-auto bg-slate-50/30 p-3 dark:bg-transparent sm:p-4 lg:p-5'
              >
                <div className='flex flex-col gap-3 sm:gap-4'>
                  {messagesLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={cn('flex flex-col gap-2', i % 2 === 0 ? 'items-end' : 'items-start')}>
                        <Skeleton className='h-12 w-40 rounded-2xl bg-slate-500/10 sm:w-56 lg:w-64' />
                      </div>
                    ))
                  ) : filteredMessages.length > 0 ? (
                    filteredMessages.map((msg, index) => {
                      const isOwn = isOwnMessage(msg)
                      const showSender = !isOwn && filteredMessages[index - 1]?.sender?.id !== msg.sender.id

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'group flex max-w-[85%] flex-col gap-1 sm:max-w-[75%] lg:max-w-[70%]',
                            isOwn ? 'items-end self-end' : 'items-start self-start'
                          )}
                        >
                          {showSender && (
                            <span className='px-1 text-[10px] font-bold uppercase tracking-wider opacity-50 sm:text-[11px]'>
                              {msg.sender.full_name}
                            </span>
                          )}
                          <div className={cn('flex items-center gap-1.5 sm:gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
                            <div
                              className={cn(
                                'px-3 py-2 text-[13px] leading-relaxed shadow-sm sm:px-3.5 sm:py-2 sm:text-[14px] lg:px-4 lg:py-2.5',
                                isOwn
                                  ? 'rounded-2xl rounded-br-md bg-primary text-primary-foreground'
                                  : 'rounded-2xl rounded-bl-md border border-slate-200/60 bg-white text-slate-800 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-100'
                              )}
                            >
                              {msg.message_type === 'image' && msg.image_url && (
                                <img src={msg.image_url} alt='Rasm' className='mb-2 max-w-full rounded-xl object-cover' />
                              )}
                              {msg.message_type === 'file' && msg.file_url && (
                                <a
                                  href={msg.file_url}
                                  className={cn(
                                    'mb-2 flex items-center gap-2 text-xs underline hover:opacity-80 sm:text-sm',
                                    isOwn ? 'text-primary-foreground/90' : 'text-slate-500 dark:text-slate-400'
                                  )}
                                >
                                  📎 Biriktirilgan fayl
                                </a>
                              )}
                              <p className='break-words'>{msg.content}</p>
                            </div>

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
                                className='h-7 w-7 shrink-0 rounded-xl text-destructive opacity-0 transition-all hover:bg-destructive/10 group-hover:opacity-100 sm:h-8 sm:w-8'
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                          <span className='px-1.5 text-[10px] font-medium opacity-40'>
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

              {/* Message Input */}
              <div className='border-t border-slate-100 bg-white/50 p-2.5 dark:border-slate-800/60 dark:bg-transparent backdrop-blur-sm sm:p-3 lg:p-4'>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className='flex items-end gap-2 sm:gap-3'
                >
                  <textarea
                    rows={1}
                    placeholder='Xabar yozing...'
                    className='min-h-[42px] w-full flex-1 resize-none rounded-2xl border border-transparent bg-slate-100 px-3 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-primary/30 focus:bg-white dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-primary/40 dark:focus:bg-slate-950 sm:min-h-[46px] sm:px-4 sm:py-3'
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
                    className='mb-0.5 h-9 w-9 shrink-0 rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-40 sm:h-10 sm:w-10 lg:h-11 lg:w-11'
                  >
                    <Send size={16} className='ml-0.5 sm:size-[18px]' />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className='hidden lg:flex h-full flex-col items-center justify-center bg-slate-50/30 p-8 text-center dark:bg-transparent'>
              <div className='max-w-md space-y-6'>
                <ChatEmptyState
                  title='Sizning xabarlaringiz'
                  description='Suhbatlashish uchun chatni tanlang yoki yangisini yarating.'
                  action={
                    <Button
                      type='button'
                      onClick={() => dispatch({ type: 'TOGGLE_NEW_CHAT', payload: true })}
                      className='mt-2 rounded-2xl bg-primary px-8 py-6 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 border-none'
                    >
                      <Plus className='mr-2 h-5 w-5' />
                      Yangi suhbat
                    </Button>
                  }
                />
              </div>
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