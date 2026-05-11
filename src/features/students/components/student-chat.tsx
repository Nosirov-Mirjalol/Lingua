import { useState, useRef, type FormEvent } from 'react'
// import { format } from 'date-fns'
import {
  Search as SearchIcon,
  Send,
  MoreVertical,
  Paperclip,
  ImagePlus,
  Plus,
  MessagesSquare,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useStudentConversations,
  useStudentConversationMessages,
  useSendStudentMessage,
} from '@/hooks/student/useStudentMessages'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export function StudentChat() {
  const [selectedConvoId, setSelectedConvoId] = useState<number | null>(null)
  const { data: conversations = [] } = useStudentConversations()
  const { data: selectedConvo } =
    useStudentConversationMessages(selectedConvoId)
  const sendMessage = useSendStudentMessage()
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'admin' | 'teacher'>('all')

  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.participant.toLowerCase().includes(search.toLowerCase())
    if (activeCategory === 'all') return matchesSearch
    
    // Simple logic for categories: if name contains 'Support' or 'Bot', it's admin
    const isAdmin = c.participant.toLowerCase().includes('support') || c.participant.toLowerCase().includes('bot')
    if (activeCategory === 'admin') return matchesSearch && isAdmin
    if (activeCategory === 'teacher') return matchesSearch && !isAdmin
    return matchesSearch
  })

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
    <div className='flex h-[calc(100vh-8rem)] w-full gap-0 overflow-hidden rounded-xl border bg-card shadow-sm lg:gap-0'>
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
                Lingua Chat
              </h2>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='relative'>
              <SearchIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <input
                type='text'
                placeholder='Search messages...'
                className='h-10 w-full rounded-xl border-none bg-background pr-4 pl-10 text-sm shadow-sm ring-1 ring-border transition-all focus:ring-2 focus:ring-rose-500 focus:outline-none'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className='flex gap-2'>
              <Button
                variant={activeCategory === 'teacher' ? 'default' : 'outline'}
                className='flex-1 h-9 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all'
                onClick={() => {
                  setActiveCategory('teacher')
                  // Auto-select first teacher if available
                  const firstTeacher = conversations.find(c => !(c.participant.toLowerCase().includes('support') || c.participant.toLowerCase().includes('bot')))
                  if (firstTeacher) setSelectedConvoId(firstTeacher.id)
                }}
              >
                Teachers
              </Button>
              <Button
                variant={activeCategory === 'admin' ? 'default' : 'outline'}
                className='flex-1 h-9 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all'
                onClick={() => {
                  setActiveCategory('admin')
                  // Auto-select admin/support if available
                  const admin = conversations.find(c => c.participant.toLowerCase().includes('support') || c.participant.toLowerCase().includes('bot'))
                  if (admin) setSelectedConvoId(admin.id)
                }}
              >
                Admin
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className='flex-1 px-2 pb-4'>
          <div className='space-y-1'>
            {filteredConversations.map((convo) => (
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
                      {convo.participant.charAt(0)}
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
            ))}
            {filteredConversations.length === 0 && (
              <div className='p-8 text-center text-muted-foreground text-sm'>
                No conversations found
              </div>
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
                    {selectedConvo.participant.charAt(0)}
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
              <div className='flex flex-col gap-4 max-w-4xl mx-auto'>
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
                        'text-[10px] font-medium text-muted-foreground px-1',
                        msg.sender === 'student' ? 'text-right' : 'text-left'
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
            <div className='p-4 bg-background/50 border-t'>
              <form
                onSubmit={handleSendMessage}
                className='flex items-end gap-2 max-w-4xl mx-auto'
              >
                <div className='flex-1 flex items-end gap-1 bg-card border rounded-[26px] px-2 py-1.5 shadow-sm transition-all focus-within:ring-1 focus-within:ring-rose-500/20'>
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
                    className='flex-1 min-h-[40px] max-h-48 resize-none bg-transparent border-none py-2.5 px-2 text-sm focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50'
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

                <Button
                  type='submit'
                  size='icon'
                  className={cn(
                    'h-12 w-12 shrink-0 rounded-full bg-rose-600 text-white shadow-md transition-all active:scale-90 flex items-center justify-center',
                    !messageText.trim() && 'opacity-0 scale-50 pointer-events-none'
                  )}
                  disabled={!messageText.trim()}
                >
                  <Send size={22} className='translate-x-0.5' />
                </Button>
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
              Welcome to Lingua Chat
            </h3>
            <p className='max-w-[320px] text-sm text-muted-foreground mb-8'>
              Select a conversation from the left to start messaging, or quickly reach out to our team:
            </p>
            <div className='grid grid-cols-2 gap-4 w-full max-w-sm'>
              <Button 
                variant='outline' 
                className='h-24 flex flex-col gap-2 rounded-2xl border-dashed border-2'
                onClick={() => {
                  setActiveCategory('admin')
                  const admin = conversations.find(c => c.participant.toLowerCase().includes('support') || c.participant.toLowerCase().includes('bot'))
                  if (admin) setSelectedConvoId(admin.id)
                }}
              >
                <div className='h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'>
                   <Plus size={18} />
                </div>
                Message Admin
              </Button>
              <Button 
                variant='outline' 
                className='h-24 flex flex-col gap-2 rounded-2xl border-dashed border-2'
                onClick={() => {
                  setActiveCategory('teacher')
                  const firstTeacher = conversations.find(c => !(c.participant.toLowerCase().includes('support') || c.participant.toLowerCase().includes('bot')))
                  if (firstTeacher) setSelectedConvoId(firstTeacher.id)
                }}
              >
                <div className='h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
                   <Plus size={18} />
                </div>
                Message Teacher
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
