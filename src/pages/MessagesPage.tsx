import { useMemo, useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { ArrowLeft, Trash2, Send, MessagesSquare } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/api/client'
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
  const [messageText, setMessageText] = useState('')
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

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

  const sendMutation = useSendMessage(selectedGroupId ?? 0)
  const deleteMutation = useDeleteMessage(selectedGroupId ?? 0)

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
          <div className='flex items-center justify-between px-4 py-3 sm:py-4'>
            <h2 className='text-sm font-bold text-slate-900 dark:text-white sm:text-base'>
              Xabarlar
            </h2>
            <span className='rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400'>
              {groups.length}
            </span>
          </div>

          <hr className='dark:border-slate-800' />

          <div className='flex-1 overflow-y-auto p-2 sm:p-3'>
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
            ) : groups.length > 0 ? (
              <div className='space-y-1'>
                {groups.map((group) => {
                  const isActive = selectedGroupId === group.id
                  return (
                    <button
                      key={group.id}
                      type='button'
                      aria-label={group.name}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm sm:gap-4 sm:p-4',
                        isActive && 'bg-white dark:bg-slate-800 shadow-md ring-1 ring-slate-100 dark:ring-slate-700'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 sm:h-12 sm:w-12',
                          isActive && 'border-rose-100 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                        )}
                      >
                        <span className='text-sm font-bold sm:text-base'>
                          {group.name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center justify-between'>
                          <span
                            className={cn(
                              'truncate text-sm font-bold text-slate-900 dark:text-white sm:text-base',
                              isActive && 'text-rose-600 dark:text-rose-400'
                            )}
                          >
                            {group.name}
                          </span>
                          {group.last_message && (
                            <span className='text-[10px] font-bold text-slate-400 dark:text-slate-500'>
                              {format(
                                new Date(group.last_message.created_at),
                                'HH:mm'
                              )}
                            </span>
                          )}
                        </div>
                        <p className='mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400'>
                          {group.last_message?.content || "Hali xabar yo'q"}
                        </p>
                      </div>
                    </button>
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
              <div className='flex h-16 shrink-0 items-center gap-3 border-b border-slate-50 dark:border-slate-800 px-4 sm:h-20 sm:gap-4 sm:px-6'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  aria-label='Orqaga'
                  className='-ml-2 rounded-xl sm:hidden'
                  onClick={() => setSelectedGroupId(null)}
                >
                  <ArrowLeft size={18} />
                </Button>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-100 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 sm:h-12 sm:w-12'>
                  <span className='text-sm font-bold sm:text-base'>
                    {selectedGroup.name[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className='text-sm leading-none font-bold text-slate-900 dark:text-white sm:text-base'>
                    {selectedGroup.name}
                  </h3>
                  <div className='mt-1 flex items-center gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-emerald-500' />
                    <span className='text-[10px] font-bold tracking-wider text-emerald-600 uppercase sm:text-[11px] dark:text-emerald-400'>
                      {selectedGroup.status}
                    </span>
                  </div>
                </div>
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
                  ) : messages.length > 0 ? (
                    messages.map((msg, index) => {
                      const isOwn = isOwnMessage(msg)
                      const showSender =
                        !isOwn &&
                        messages[index - 1]?.sender?.id !== msg.sender.id

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
            <div className='flex flex-1 flex-col items-center justify-center p-8 text-center sm:p-12'>
              <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-200 dark:text-rose-800 sm:mb-8 sm:h-28 sm:w-28'>
                <MessagesSquare size={40} className='sm:h-14 sm:w-14' />
              </div>
              <h3 className='mb-3 text-xl font-black text-slate-900 dark:text-white sm:text-2xl'>
                Chat tanlang
              </h3>
              <p className='max-w-xs text-sm text-slate-500 dark:text-slate-400'>
                Chap tomondagi ro'yxatdan guruhni tanlang va muloqotni boshlang.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
