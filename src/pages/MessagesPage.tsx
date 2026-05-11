import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ArrowLeft, Trash2, Send, MessagesSquare, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import {
  useDeleteMessage,
  useGroupMessages,
  useMessageGroups,
  useSendMessage,
} from '@/hooks/useMessages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

export function MessagesPage() {
  const currentUserId = Number(useAuthStore((s) => s.auth.user?.accountNo ?? 0))
  const [search, setSearch] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [messageText, setMessageText] = useState('')

  const {
    data: groups = [],
    isLoading: groupsLoading,
    isError: groupsIsError,
  } = useMessageGroups()

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? groups.filter((g) => g.name.toLowerCase().includes(q)) : groups
  }, [groups, search])

  // ✅ BU YER — selectedGroup define qilindi
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

  const handleSend = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedGroupId) return
    sendMutation.mutate(
      { content: messageText.trim() },
      { onSuccess: () => setMessageText('') }
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
    <div className='flex h-[calc(100vh-8rem)] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50'>
      {/* Sidebar */}
      <div
        className={cn(
          'flex w-full flex-col border-r border-slate-100 bg-slate-50/50 sm:w-80 lg:w-96',
          selectedGroupId && 'hidden sm:flex'
        )}
      >
        <div className='space-y-4 p-6'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-white'>
              <MessagesSquare size={20} />
            </div>
            <div>
              <h2 className='text-lg font-bold text-slate-900'>Lingua Chat</h2>
              <p className='text-[10px] font-bold tracking-wider text-slate-400 uppercase'>
                Teacher Portal
              </p>
            </div>
          </div>

          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
            <Input
              placeholder='Qidirish...'
              className='h-11 rounded-2xl border-none bg-white pl-10 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-rose-500'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className='flex-1 px-3 pb-6'>
          <div className='space-y-1'>
            {groupsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='flex items-center gap-3 p-3'>
                  <Skeleton className='h-12 w-12 rounded-2xl' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-1/2' />
                    <Skeleton className='h-3 w-3/4' />
                  </div>
                </div>
              ))
            ) : filteredGroups.length > 0 ? (
              filteredGroups.map((group) => {
                const isActive = selectedGroupId === group.id
                return (
                  <button
                    key={group.id}
                    type='button'
                    aria-label={group.name}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-all hover:bg-white hover:shadow-md',
                      isActive && 'bg-white shadow-lg ring-1 ring-slate-100'
                    )}
                  >
                    <div className='relative shrink-0'>
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 text-slate-600',
                          isActive && 'border-rose-100 bg-rose-50 text-rose-600'
                        )}
                      >
                        <span className='text-lg font-bold'>
                          {group.name[0]?.toUpperCase()}
                        </span>
                      </div>
                      {group.unread_count > 0 && (
                        <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white'>
                          {group.unread_count}
                        </span>
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center justify-between'>
                        <span
                          className={cn(
                            'truncate font-bold text-slate-900',
                            isActive && 'text-rose-600'
                          )}
                        >
                          {group.name}
                        </span>
                        {group.last_message && (
                          <span className='text-[10px] font-bold text-slate-400'>
                            {format(
                              new Date(group.last_message.created_at),
                              'HH:mm'
                            )}
                          </span>
                        )}
                      </div>
                      <p className='mt-0.5 truncate text-xs text-slate-500'>
                        {group.last_message?.content || "Hali xabar yo'q"}
                      </p>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className='p-8 text-center text-sm text-slate-400'>
                Guruhlar topilmadi
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div
        className={cn(
          'flex flex-1 flex-col bg-white',
          !selectedGroupId && 'hidden sm:flex'
        )}
      >
        {selectedGroup ? (
          <>
            {/* Header */}
            <div className='flex h-20 items-center justify-between border-b border-slate-50 px-6'>
              <div className='flex items-center gap-4'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  aria-label='Orqaga'
                  className='-ml-2 rounded-full sm:hidden'
                  onClick={() => setSelectedGroupId(null)}
                >
                  <ArrowLeft size={20} />
                </Button>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600'>
                  <span className='text-lg font-bold'>
                    {selectedGroup.name[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className='text-base leading-none font-bold text-slate-900'>
                    {selectedGroup.name}
                  </h3>
                  <div className='mt-1.5 flex items-center gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-emerald-500' />
                    <span className='text-[11px] font-bold tracking-wider text-emerald-600 uppercase'>
                      {selectedGroup.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className='flex-1 bg-slate-50/30 p-6'>
              <div className='flex flex-col gap-6'>
                {messagesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex flex-col gap-2',
                        i % 2 === 0 ? 'items-end' : 'items-start'
                      )}
                    >
                      <Skeleton className='h-10 w-48 rounded-2xl' />
                      <Skeleton className='h-3 w-12' />
                    </div>
                  ))
                ) : messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const isOwn = msg.sender.id === currentUserId
                    const prevMsg = messages[idx - 1]
                    const showSender =
                      !isOwn && prevMsg?.sender.id !== msg.sender.id

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
                          <span className='ml-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase'>
                            {msg.sender.full_name}
                          </span>
                        )}
                        <div className='relative flex items-center gap-2'>
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
                              className='h-8 w-8 rounded-full text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600'
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                          <div
                            className={cn(
                              'rounded-3xl px-5 py-3 text-sm shadow-sm',
                              isOwn
                                ? 'rounded-br-none bg-rose-600 text-white'
                                : 'rounded-bl-none border border-slate-100 bg-white text-slate-700'
                            )}
                          >
                            {msg.message_type === 'image' && msg.image_url && (
                              <img
                                src={msg.image_url}
                                alt='Rasm'
                                className='mb-2 max-w-xs rounded-xl'
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
                        <span className='px-1 text-[10px] font-bold text-slate-400'>
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <div className='flex flex-1 items-center justify-center p-8 text-center text-slate-400'>
                    Hali xabarlar yo'q
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Composer */}
            <div className='border-t border-slate-50 p-6'>
              <form onSubmit={handleSend} className='flex items-end gap-3'>
                <textarea
                  rows={1}
                  placeholder='Xabar yozing...'
                  className='flex-1 resize-none rounded-3xl border-none bg-slate-100/50 px-6 py-3.5 text-sm placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-500/10 focus:outline-none'
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
                  className='h-12 w-12 shrink-0 rounded-2xl bg-rose-600 text-white shadow-xl shadow-rose-200 hover:bg-rose-700 active:scale-95 disabled:opacity-50'
                >
                  <Send size={20} className='ml-0.5' />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className='flex flex-1 flex-col items-center justify-center p-12 text-center'>
            <div className='mb-8 flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-rose-50 text-rose-200'>
              <MessagesSquare size={56} />
            </div>
            <h3 className='mb-3 text-2xl font-black text-slate-900'>
              Chat tanlang
            </h3>
            <p className='max-w-xs text-sm text-slate-500'>
              Chap tomondagi ro'yxatdan guruhni tanlang va muloqotni boshlang.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
