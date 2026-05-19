import { useRef, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  MessagesSquare,
  MoreVertical,
  Paperclip,
  Search as SearchIcon,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useAdminConversationMessages,
  useAdminConversations,
  useSendAdminMessage,
} from '@/hooks/admin/useAdminMessages'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RoseButton } from '@/components/ui/rose-button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfigDrawer } from '@/components/config-drawer'
import { AdminHeader } from '@/components/layout/admin-header'
import { Main } from '@/components/layout/main'

export function AdminChat() {
  const [selectedConvoId, setSelectedConvoId] = useState<number | null>(null)
  const { data: conversations = [], isLoading } = useAdminConversations()
  const { data: selectedConvo } = useAdminConversationMessages(selectedConvoId)
  const sendMessage = useSendAdminMessage()
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [search, setSearch] = useState('')

  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const filteredConversations = conversations.filter((c) =>
    c.participant?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConvoId) return

    sendMessage.mutate({
      conversationId: selectedConvoId,
      message: messageText.trim(),
    })
    setMessageText('')
  }

  const handlePickImage = () => imageInputRef.current?.click()
  const handlePickFile = () => fileInputRef.current?.click()

  return (
    <>
      <AdminHeader fixed>
        <ConfigDrawer />
      </AdminHeader>

      <Main>
        <div className='flex h-[calc(100vh-7rem)] w-full gap-0 overflow-hidden rounded-xl border bg-card shadow-sm lg:gap-0'>
          {/* Sidebar - Conversation List */}
          <div
            className={cn(
              'flex w-full flex-col border-r bg-muted/30 sm:w-80 lg:w-96',
              mobileShowChat && 'hidden sm:flex'
            )}
          >
            <div className='space-y-4 p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white'>
                    <MessagesSquare size={18} />
                  </div>
                  <h2 className='text-lg font-semibold text-foreground'>
                    Admin Chat
                  </h2>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='relative'>
                  <SearchIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                    placeholder='Search conversations...'
                    className='h-10 rounded-xl border-none bg-background shadow-sm ring-1 ring-border focus-visible:ring-2 focus-visible:ring-rose-500'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <ScrollArea className='flex-1 px-2 pb-4'>
              <div className='space-y-1'>
                {isLoading ? (
                  <div className='flex h-40 items-center justify-center'>
                    <Loader2 className='animate-spin text-muted-foreground' />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className='p-8 text-center text-sm text-muted-foreground'>
                    No conversations found
                  </div>
                ) : (
                  filteredConversations.map((convo) => (
                    <button
                      key={convo.id}
                      onClick={() => {
                        setSelectedConvoId(convo.id)
                        setMobileShowChat(true)
                      }}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:bg-accent/50',
                        selectedConvoId === convo.id &&
                          'bg-accent shadow-sm ring-1 ring-border'
                      )}
                    >
                      <div className='relative'>
                        <Avatar className='h-12 w-12 border-2 border-background shadow-sm'>
                          <AvatarFallback className='bg-muted text-muted-foreground'>
                            {convo.participant?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {convo.unread > 0 && (
                          <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-medium text-white ring-2 ring-background'>
                            {convo.unread}
                          </span>
                        )}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center justify-between'>
                          <span className='truncate font-semibold text-foreground'>
                            {convo.participant}
                          </span>
                          <span className='text-[10px] font-medium text-muted-foreground'>
                            {convo.time}
                          </span>
                        </div>
                        <p className='line-clamp-1 truncate text-sm text-muted-foreground'>
                          {convo.lastMessage}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Chat Area */}
          <div
            className={cn(
              'flex flex-1 flex-col bg-card',
              !mobileShowChat && 'hidden sm:flex'
            )}
          >
            {selectedConvo ? (
              <>
                {/* Chat Header */}
                <div className='flex h-16 items-center justify-between border-b px-4 lg:px-6'>
                  <div className='flex items-center gap-3'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='-ml-2 sm:hidden'
                      onClick={() => setMobileShowChat(false)}
                    >
                      <ArrowLeft size={20} />
                    </Button>
                    <Avatar className='h-10 w-10 shadow-sm'>
                      <AvatarFallback className='bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'>
                        {selectedConvo.participant?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className='text-sm leading-none font-bold text-foreground'>
                        {selectedConvo.participant}
                      </h3>
                      <span className='text-[10px] font-medium text-emerald-500'>
                        Online
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-9 w-9 rounded-full text-muted-foreground'
                    >
                      <SearchIcon size={18} />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-9 w-9 rounded-full text-muted-foreground'
                    >
                      <MoreVertical size={18} />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className='flex-1 bg-muted/5 p-4 lg:p-6'>
                  <div className='mx-auto flex max-w-4xl flex-col gap-4'>
                    <div className='mx-auto rounded-full bg-muted/80 px-4 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase'>
                      Today
                    </div>

                    {selectedConvo.messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex max-w-[85%] flex-col gap-1',
                          msg.sender === 'student' ? 'self-end' : 'self-start'
                        )}
                      >
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2 text-sm shadow-sm',
                            msg.sender === 'student'
                              ? 'rounded-br-none bg-rose-600 text-white'
                              : 'rounded-bl-none border bg-card text-foreground'
                          )}
                        >
                          {msg.body}
                        </div>
                        <span
                          className={cn(
                            'px-1 text-[10px] font-medium text-muted-foreground',
                            msg.sender === 'student'
                              ? 'text-right'
                              : 'text-left'
                          )}
                        >
                          {msg.time}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div ref={scrollRef} />
                </ScrollArea>

                {/* Telegram-style Input Area */}
                <div className='border-t bg-background/50 p-4'>
                  <form
                    onSubmit={handleSendMessage}
                    className='mx-auto flex max-w-4xl items-end gap-2'
                  >
                    <div className='flex flex-1 items-end gap-1 rounded-[26px] border bg-card px-2 py-1.5 shadow-sm transition-all focus-within:ring-1 focus-within:ring-rose-500/20'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400'
                        onClick={handlePickFile}
                      >
                        <Paperclip size={20} />
                      </Button>

                      <textarea
                        rows={1}
                        placeholder='Message...'
                        className='max-h-48 min-h-10 flex-1 resize-none border-none bg-transparent px-2 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:ring-0 focus:outline-none'
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage(e)
                          }
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement
                          target.style.height = 'auto'
                          target.style.height = `${target.scrollHeight}px`
                        }}
                      />

                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400'
                        onClick={handlePickImage}
                      >
                        <ImagePlus size={20} />
                      </Button>
                    </div>

                    <RoseButton
                      type='submit'
                      roseSize='lg'
                      className={cn(
                        'h-12 w-12 shrink-0 rounded-full p-0 transition-all',
                        !messageText.trim() &&
                          'pointer-events-none scale-50 opacity-0'
                      )}
                      disabled={!messageText.trim()}
                    >
                      <Send size={22} className='translate-x-0.5' />
                    </RoseButton>
                  </form>

                  <input
                    ref={imageInputRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                  />
                  <input ref={fileInputRef} type='file' className='hidden' />
                </div>
              </>
            ) : (
              <div className='flex flex-1 flex-col items-center justify-center p-8 text-center'>
                <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-muted text-muted-foreground/20'>
                  <MessagesSquare size={48} />
                </div>
                <h3 className='mb-2 text-xl font-bold text-foreground'>
                  Admin Chat
                </h3>
                <p className='max-w-[320px] text-sm text-muted-foreground'>
                  Select a conversation from the left to start messaging.
                </p>
              </div>
            )}
          </div>
        </div>
      </Main>
    </>
  )
}
