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

  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const filteredConversations = conversations.filter((c) =>
    c.participant.toLowerCase().includes(search.toLowerCase())
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
    <div className='flex h-[calc(100vh-8rem)] w-full gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:gap-0'>
      {/* Sidebar - Conversation List */}
      <div
        className={cn(
          'flex w-full flex-col border-r border-slate-100 bg-slate-50/50 sm:w-80 lg:w-96',
          mobileShowChat && 'hidden sm:flex'
        )}
      >
        <div className='space-y-4 p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white'>
                <MessagesSquare size={18} />
              </div>
              <h2 className='text-lg font-semibold text-slate-900'>
                Lingua Chat
              </h2>
            </div>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <Plus size={20} className='text-slate-500' />
            </Button>
          </div>

          <div className='relative'>
            <SearchIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
            <input
              type='text'
              placeholder='Search messages...'
              className='h-10 w-full rounded-xl border-none bg-white pr-4 pl-10 text-sm shadow-sm ring-1 ring-slate-200 transition-all focus:ring-2 focus:ring-rose-500 focus:outline-none'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                  'group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:bg-white hover:shadow-sm',
                  selectedConvoId === convo.id &&
                    'bg-white shadow-md ring-1 ring-slate-100'
                )}
              >
                <div className='relative'>
                  <Avatar className='h-12 w-12 border-2 border-white shadow-sm'>
                    <AvatarFallback className='bg-slate-100 text-slate-600'>
                      {convo.participant.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {convo.unread > 0 && (
                    <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-medium text-white ring-2 ring-white'>
                      {convo.unread}
                    </span>
                  )}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center justify-between'>
                    <span className='truncate font-semibold text-slate-900'>
                      {convo.participant}
                    </span>
                    <span className='text-[10px] font-medium text-slate-400'>
                      {convo.time}
                    </span>
                  </div>
                  <p className='line-clamp-1 truncate text-sm text-slate-500'>
                    {convo.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          'flex flex-1 flex-col bg-white',
          !mobileShowChat && 'hidden sm:flex'
        )}
      >
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <div className='flex h-16 items-center justify-between border-b border-slate-100 px-4 lg:px-6'>
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
                  <AvatarFallback className='bg-rose-50 text-rose-600'>
                    {selectedConvo.participant.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='text-sm leading-none font-bold text-slate-900'>
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
                  className='h-9 w-9 rounded-full text-slate-400'
                >
                  <SearchIcon size={18} />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-9 w-9 rounded-full text-slate-400'
                >
                  <MoreVertical size={18} />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className='flex-1 bg-slate-50/30 p-4 lg:p-6'>
              <div className='flex flex-col gap-4'>
                <div className='mx-auto rounded-full bg-slate-100/80 px-4 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase'>
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
                        'rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                        msg.sender === 'student'
                          ? 'rounded-br-none bg-rose-600 text-white'
                          : 'rounded-bl-none border border-slate-100 bg-white text-slate-700'
                      )}
                    >
                      {msg.body}
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-medium text-slate-400',
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

            {/* Input Area */}
            <div className='border-t border-slate-100 p-4'>
              <form
                onSubmit={handleSendMessage}
                className='flex items-end gap-2 lg:gap-3'
              >
                <div className='mb-1 flex gap-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-9 w-9 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                    onClick={handlePickImage}
                  >
                    <ImagePlus size={20} />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-9 w-9 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                    onClick={handlePickFile}
                  >
                    <Paperclip size={20} />
                  </Button>
                </div>

                <div className='relative flex-1'>
                  <textarea
                    rows={1}
                    placeholder='Write a message...'
                    className='block w-full resize-none rounded-2xl border-none bg-slate-100/80 px-4 py-2.5 text-sm focus:bg-slate-100 focus:ring-2 focus:ring-rose-500/20 focus:outline-none'
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                </div>

                <Button
                  type='submit'
                  size='icon'
                  className='h-10 w-10 shrink-0 rounded-full bg-rose-600 text-white shadow-lg transition-transform hover:bg-rose-700 active:scale-95'
                  disabled={!messageText.trim()}
                >
                  <Send size={18} className='ml-0.5' />
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
            <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-50 text-slate-200'>
              <MessagesSquare size={48} />
            </div>
            <h3 className='mb-2 text-xl font-bold text-slate-900'>
              Select a conversation
            </h3>
            <p className='max-w-[280px] text-sm text-slate-500'>
              Choose a teacher from the left to start a real-time conversation
              about your studies.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
