import { useMemo, useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { ArrowLeft, Plus, Search as SearchIcon, Trash2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/api/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChatEmptyState } from '@/components/shared/chat/chat-empty-state'
import { ChatListHeader } from '@/components/shared/chat/chat-list-header'
import { ChatListItem } from '@/components/shared/chat/chat-list-item'
import { NewChat } from '@/features/chats/components/new-chat'
import type { ChatUser } from '@/features/chats/data/chat-types'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import {
  useDeleteMessage,
  useGroupMessages,
  useMessageGroups,
  useSendMessage,
} from '@/hooks/useMessages'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export interface MessageSender {
  id: number
  username: string
  full_name: string
  role: 'admin' | 'teacher' | 'student'
  accountNo?: string
}

export interface LastMessage {
  content: string
  type: string
  sender: string
  created_at: string
}

export interface MessageGroup {
  id: number
  name: string
  status: string
  unread_count: number
  last_message: LastMessage | null
}

export interface Message {
  id: number
  group: number
  sender: MessageSender
  content: string
  message_type: 'text' | 'file' | 'image'
  file_url: string | null
  image_url: string | null
  is_read: boolean
  read_count: number
  is_own?: boolean
  created_at: string
}

export interface MessagesResponse {
  count: number
  page: number
  page_size: number
  results: Message[]
}

export function MessagesPage() {
  const auth = useAuthStore((s) => s.auth)
  const currentUserId: number | null = auth.user?.accountNo
    ? parseInt(auth.user.accountNo, 10)
    : null

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [createConversationDialogOpened, setCreateConversationDialog] =
    useState(false)
  const [search, setSearch] = useState('')
  const [chatSearch, setChatSearch] = useState('')
  const [showChatSearch, setShowChatSearch] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const response = await apiClient.get<any>('/api/auth/my-profile-list/')
        let profile
        if (Array.isArray(response)) {
          profile = response[0]
        } else if (response?.results && Array.isArray(response.results)) {
          profile = response.results[0]
        } else if (typeof response === 'object') {
          profile = response
        }
        if (profile?.username) {
          setCurrentUsername(profile.username)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    fetchCurrentProfile()
  }, [])

  const {
    data: groups = [],
    isLoading: groupsLoading,
    isError: groupsIsError,
  } = useMessageGroups()

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) ?? null,
    [groups, selectedGroupId]
  )
  const filteredGroups = useMemo(
    () =>
      groups.filter((group) =>
        group.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [groups, search]
  )
  const chatUsers = useMemo(
    () =>
      groups.map((group) => ({
        id: String(group.id),
        username: group.name.toLowerCase().replace(/\s+/g, '.'),
        fullName: group.name,
        profile: '/placeholder.svg',
        status: group.status.toLowerCase() === 'active' ? 'online' : 'offline',
      })) as Omit<ChatUser, 'messages'>[],
    [groups]
  )

  const { data: messagesResp, isLoading: messagesLoading } = useGroupMessages(
    selectedGroupId ?? 0
  )

  const messages = useMemo(
    () =>
      [...(messagesResp?.results ?? [])].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [messagesResp]
  )
  const filteredMessages = useMemo(() => {
    if (!showChatSearch || !chatSearch.trim()) return messages

    return messages.filter((message) =>
      message.content.toLowerCase().includes(chatSearch.trim().toLowerCase())
    )
  }, [chatSearch, messages, showChatSearch])

  const sendMutation = useSendMessage(selectedGroupId ?? 0)
  const deleteMutation = useDeleteMessage(selectedGroupId ?? 0)

  const handleStartChat = (users: Omit<ChatUser, 'messages'>[]) => {
    const nextGroupId = Number(users[0]?.id)
    if (!Number.isFinite(nextGroupId)) return

    setSelectedGroupId(nextGroupId)
    setCreateConversationDialog(false)
  }

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedGroupId) return
    sendMutation.mutate(
      { content: messageText.trim() },
      {
        onSuccess: () => {
          setMessageText('')
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight
            }
          }, 100)
        },
      }
    )
  }

  const isOwnMessage = (msg: Message): boolean => {
    // 1. Backend is_own field (most reliable)
    if (typeof msg.is_own === 'boolean') return msg.is_own

    // 2. AccountNo comparison (most reliable since both come from auth)
    if (auth.user?.accountNo && msg.sender?.accountNo) {
      return auth.user.accountNo === msg.sender.accountNo
    }

    // 3. Username comparison (fallback)
    if (currentUsername && msg.sender?.username) {
      return msg.sender.username === currentUsername
    }

    // 4. ID comparison (last resort - might not work if IDs are different types)
    if (currentUserId !== null && msg.sender?.id) {
      return msg.sender.id === currentUserId
    }

    return false
  }

  if (groupsIsError) {
    return (
      <div className='flex h-full items-center justify-center text-slate-500 dark:text-slate-400'>
        Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-7xl'>
      <div className='flex h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)] dark:shadow-none'>
        {/* Sidebar */}
        <div
          className={cn(
            'flex w-full flex-col border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 sm:w-80 lg:w-96',
            selectedGroupId && 'hidden sm:flex'
          )}
        >
          <div className='flex-1 overflow-y-auto p-2 sm:p-3'>
            <ChatListHeader
              title='Student Chat'
              count={groups.length}
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder='Search people or messages...'
              action={
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setCreateConversationDialog(true)}
                  className='h-10 w-10 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600'
                >
                  <Plus size={20} />
                </Button>
              }
            />

            {groupsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
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
                {filteredGroups.map((group) => {
                  const isActive = selectedGroupId === group.id
                  const lastPreview = group.last_message
                    ? `${group.last_message.sender}: ${group.last_message.content}`
                    : "Hali xabar yo'q"
                  return (
                    <ChatListItem
                      key={group.id}
                      active={isActive}
                      fallback={group.name[0]?.toUpperCase() ?? 'G'}
                      title={group.name}
                      preview={lastPreview}
                      time={
                        group.last_message
                          ? format(new Date(group.last_message.created_at), 'HH:mm')
                          : null
                      }
                      online={group.status.toLowerCase() === 'active'}
                      onClick={() => setSelectedGroupId(group.id)}
                    />
                  )
                })}
              </div>
            ) : (
              <div className='p-6 text-center text-sm text-slate-400 dark:text-slate-500 sm:p-8'>
                Guruhlar topilmadi
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div
          className={cn(
            'flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#020617]',
            !selectedGroupId && 'hidden sm:flex'
          )}
        >
          {selectedGroup ? (
            <>
              {/* Header */}
              <div className='flex flex-col border-b border-slate-100'>
                <div className='flex items-center justify-between px-6 py-4'>
                  <div className='flex items-center gap-4'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      aria-label='Orqaga'
                      className='-ml-2 rounded-xl md:hidden'
                      onClick={() => setSelectedGroupId(null)}
                    >
                      <ArrowLeft className='h-5 w-5' />
                    </Button>

                    <div className='relative'>
                      <Avatar className='h-10 w-10 border border-slate-100'>
                        <AvatarFallback className='bg-rose-100 text-rose-700'>
                          {selectedGroup.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {selectedGroup.status.toLowerCase() === 'active' ? (
                        <span className='absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500' />
                      ) : null}
                    </div>

                    <div className='flex flex-col'>
                      <h2 className='text-base font-bold text-slate-900'>
                        {selectedGroup.name}
                      </h2>
                      <span className='text-xs font-medium text-green-500'>
                        {selectedGroup.status.toLowerCase() === 'active'
                          ? 'Online'
                          : selectedGroup.status}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-9 w-9 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      onClick={() => setShowChatSearch((prev) => !prev)}
                    >
                      <SearchIcon size={20} />
                    </Button>
                  </div>
                </div>

                {showChatSearch ? (
                  <div className='px-6 pb-4'>
                    <div className='relative'>
                      <SearchIcon
                        size={14}
                        className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400'
                      />
                      <input
                        type='text'
                        autoFocus
                        placeholder='Search in this chat...'
                        className='h-9 w-full rounded-lg bg-slate-100 pl-9 pr-4 text-sm outline-none'
                        value={chatSearch}
                        onChange={(event) => setChatSearch(event.target.value)}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className='flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/10 p-4 sm:p-6'
              >
                <div className='flex flex-col gap-4 sm:gap-6'>
                  {messagesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex flex-col gap-2',
                          i % 2 === 0 ? 'items-end' : 'items-start'
                        )}
                      >
                        <Skeleton className='h-8 w-40 rounded-xl sm:h-10 sm:w-48' />
                        <Skeleton className='h-3 w-10' />
                      </div>
                    ))
                  ) : filteredMessages.length > 0 ? (
                    filteredMessages.map((msg, index) => {
                      const isOwn = isOwnMessage(msg)
                      const previousMessage = filteredMessages[index - 1]
                      const showSender =
                        !isOwn &&
                        previousMessage?.sender?.id !== msg.sender.id

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'group flex max-w-[80%] flex-col gap-1.5',
                            isOwn
                              ? 'items-end self-end'
                              : 'items-start self-start'
                          )}
                        >
                          {showSender && (
                            <span className='ml-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500'>
                              {msg.sender.full_name}
                            </span>
                          )}
                          <div
                            className={cn(
                              'relative flex items-center gap-2',
                              isOwn ? 'flex-row-reverse' : 'flex-row'
                            )}
                          >
                            {isOwn && (
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                aria-label="Xabarni o'chirish"
                                onClick={() =>
                                  deleteMutation.mutate(
                                    { messageId: msg.id },
                                    {
                                      onSuccess: () =>
                                        toast.success("Xabar o'chirildi"),
                                    }
                                  )
                                }
                                className='h-8 w-8 rounded-xl opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-600'
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                            <div
                              className={cn(
                                'max-w-full rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:px-5 sm:py-3',
                                isOwn
                                  ? 'rounded-br-none bg-rose-600 text-white shadow-rose-900/20'
                                  : 'rounded-bl-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100'
                              )}
                            >
                              {msg.message_type === 'image' &&
                                msg.image_url && (
                                  <img
                                    src={msg.image_url}
                                    alt='Rasm'
                                    className='mb-2 max-w-xs rounded-lg'
                                  />
                                )}
                              {msg.message_type === 'file' && msg.file_url && (
                                <a
                                  href={msg.file_url}
                                  className='mb-2 flex items-center gap-2 underline underline-offset-4'
                                >
                                  📎 Faylni ko'rish
                                </a>
                              )}
                              <p className='leading-relaxed'>{msg.content}</p>
                            </div>
                          </div>
                          <span className='px-1 text-[10px] font-bold text-slate-400 dark:text-slate-500'>
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </span>
                        </div>
                      )
                    })
                    ) : (
                      <div className='flex flex-1 items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500'>
                        Hali xabarlar yo'q
                      </div>
                    )}
                </div>
              </div>

              {/* Composer */}
              <div className='shrink-0 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-[#020617] p-4 sm:p-6'>
                <form onSubmit={handleSend} className='flex items-end gap-3'>
                  <textarea
                    rows={1}
                    placeholder='Xabar yozing...'
                    className='flex-1 resize-none rounded-2xl border-none bg-slate-100/50 dark:bg-slate-900/50 px-5 py-3 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-rose-500/10 focus:outline-none sm:px-6 sm:py-3.5'
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) handleSend(e)
                    }}
                  />
                  <Button
                    type='submit'
                    size='icon'
                    aria-label='Yuborish'
                    disabled={!messageText.trim() || sendMutation.isPending}
                    className='h-10 w-10 shrink-0 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-700 active:scale-95 disabled:opacity-50 sm:h-12 sm:w-12'
                  >
                    <Send size={18} className='ml-0.5 sm:h-5 sm:w-5' />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <ChatEmptyState
              title='Your messages'
              description='Select a chat to start messaging or create a new one.'
              action={
                <Button
                  onClick={() => setCreateConversationDialog(true)}
                  className='mt-8 rounded-xl bg-rose-600 px-8 py-6 text-base font-semibold shadow-lg shadow-rose-200 hover:bg-rose-700'
                >
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
