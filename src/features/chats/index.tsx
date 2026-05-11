import { type FormEvent, useRef, useState, useMemo } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Edit,
  ImagePlus,
  MessagesSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  Search as SearchIcon,
  Send,
  Video,
  Trash2,
  UserX,
  VolumeX,
  UserCircle,
  Pin,
  Archive,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { NewChat } from './components/new-chat'
import { type ChatUser, type Convo } from './data/chat-types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// Fake Data
import { conversations } from './data/convo.json'

export function Chats() {
  const [search, setSearch] = useState('')
  const [chatSearch, setChatSearch] = useState('')
  const [showChatSearch, setShowChatSearch] = useState(false)
  const [chatList, setChatList] = useState<ChatUser[]>(conversations)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [mobileSelectedUser, setMobileSelectedUser] = useState<ChatUser | null>(
    null
  )
  const [createConversationDialogOpened, setCreateConversationDialog] =
    useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editUsernameOpen, setEditUsernameOpen] = useState(false)
  const [newUsername, setNewUsername] = useState('satnaing')

  const [messageText, setMessageText] = useState('')
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Filtered data based on the search query
  const filteredChatList = chatList.filter(({ fullName }) =>
    fullName.toLowerCase().includes(search.trim().toLowerCase())
  )

  const selectedUser = useMemo(() =>
    selectedUserId ? (chatList.find((u) => u.id === selectedUserId) ?? null) : null,
    [selectedUserId, chatList]
  )

  const currentMessageGroups = useMemo(() => {
    if (!selectedUser) return {}

    let messages = selectedUser.messages
    if (showChatSearch && chatSearch.trim()) {
      messages = messages.filter(m =>
        m.message.toLowerCase().includes(chatSearch.trim().toLowerCase())
      )
    }

    return messages.reduce(
      (acc: Record<string, Convo[]>, obj) => {
        const key = format(new Date(obj.timestamp), 'd MMMM, yyyy')
        if (!acc[key]) acc[key] = []
        acc[key].push(obj)
        return acc
      },
      {}
    )
  }, [selectedUser, chatSearch, showChatSearch])

  const users = conversations.map(({ messages, ...user }) => user)

  const handleSendMessage = (payload: { message: string }) => {
    if (!selectedUserId) return
    const nextMessage: Convo = {
      sender: 'You',
      message: payload.message,
      timestamp: new Date().toISOString(),
    }

    setChatList((prev) =>
      prev.map((u) =>
        u.id === selectedUserId
          ? { ...u, messages: [nextMessage, ...u.messages] }
          : u
      )
    )

    // Auto scroll to bottom
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0
      }
    }, 100)
  }

  const handleSubmitText = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = messageText.trim()
    if (!trimmed) return
    handleSendMessage({ message: trimmed })
    setMessageText('')
  }

  const handlePickImage = () => imageInputRef.current?.click()
  const handlePickFile = () => fileInputRef.current?.click()

  const handleDeleteChat = () => {
    if (!selectedUserId) return
    setChatList(prev => prev.filter(u => u.id !== selectedUserId))
    setSelectedUserId(null)
    setMobileSelectedUser(null)
    setDeleteDialogOpen(false)
    toast.success('Chat deleted successfully')
  }

  const handleUpdateUsername = () => {
    toast.success(`Username updated to ${newUsername}`)
    setEditUsernameOpen(false)
  }

  return (
    <>
      <Header>
        <div className='flex flex-1 items-center gap-4'>
           <div className='relative hidden w-full max-w-md md:block'>
            <SearchIcon className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400' size={16} />
            <input
              type='search'
              placeholder='Search globally...'
              className='h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50'
            />
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <section className='flex h-full gap-0 md:gap-6'>
          {/* Left Side - Chat List */}
          <div className='flex w-full flex-col gap-4 border-r border-border/50 pr-0 md:w-80 md:pr-2 lg:w-96'>
            <div className='flex flex-col gap-4 px-4 pt-4 md:px-0'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <h1 className='text-2xl font-bold tracking-tight'>Lingua Chat</h1>
                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600'>
                    {chatList.length}
                  </div>
                </div>

                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setCreateConversationDialog(true)}
                  className='h-10 w-10 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600'
                >
                  <Plus size={20} />
                </Button>
              </div>

              <div className='relative'>
                <SearchIcon size={16} className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400' />
                <input
                  type='text'
                  className='h-11 w-full rounded-xl border-none bg-slate-100 pl-10 pr-4 text-sm outline-none transition-all focus:bg-slate-200/50 focus:ring-2 focus:ring-rose-500/10'
                  placeholder='Search people or messages...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className='flex-1 px-4 md:px-0'>
              <div className='flex flex-col gap-1 py-2'>
                {filteredChatList.map((chatUsr) => {
                  const { id, profile, username, messages, fullName, status } = chatUsr
                  const lastConvo = messages[0]
                  const isSelected = selectedUserId === id
                  const lastMsg = lastConvo.sender === 'You' ? `You: ${lastConvo.message}` : lastConvo.message

                  return (
                    <button
                      key={id}
                      type='button'
                      className={cn(
                        'group relative flex w-full items-center gap-3 rounded-2xl p-3 text-start transition-all duration-200',
                        isSelected
                          ? 'bg-rose-50 shadow-sm ring-1 ring-rose-100'
                          : 'hover:bg-slate-50'
                      )}
                      onClick={() => {
                        setSelectedUserId(id)
                        setMobileSelectedUser(chatUsr)
                      }}
                    >
                      <div className='relative flex-shrink-0'>
                        <Avatar className='h-12 w-12 border-2 border-background shadow-sm'>
                          <AvatarImage src={profile} alt={username} />
                          <AvatarFallback className='bg-rose-100 text-rose-700 font-semibold'>
                            {fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {status === 'online' && (
                          <span className='absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500' />
                        )}
                      </div>

                      <div className='flex flex-1 flex-col overflow-hidden'>
                        <div className='flex items-center justify-between gap-2'>
                          <span className={cn('truncate font-semibold text-slate-900', isSelected && 'text-rose-900')}>
                            {fullName}
                          </span>
                          <span className='text-[11px] text-slate-400'>
                            {format(new Date(lastConvo.timestamp), 'HH:mm')}
                          </span>
                        </div>
                        <span className={cn(
                          'line-clamp-1 text-sm text-slate-500 transition-colors',
                          isSelected ? 'text-rose-600/70' : 'group-hover:text-slate-600'
                        )}>
                          {lastMsg}
                        </span>
                      </div>

                      {isSelected && (
                        <div className='absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-rose-500' />
                      )}
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Chat Content */}
          {selectedUser ? (
            <div
              className={cn(
                'absolute inset-0 z-50 flex flex-1 flex-col bg-background md:static md:z-auto md:rounded-3xl md:border md:bg-white md:shadow-xl md:shadow-slate-200/50',
                !mobileSelectedUser && 'hidden md:flex'
              )}
            >
              {/* Chat Header */}
              <div className='flex flex-col border-b border-slate-100'>
                <div className='flex items-center justify-between px-6 py-4'>
                  <div className='flex items-center gap-4'>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='-ml-2 md:hidden'
                      onClick={() => {
                        setMobileSelectedUser(null)
                        setSelectedUserId(null)
                      }}
                    >
                      <ArrowLeft className='h-5 w-5' />
                    </Button>

                    <div className='relative'>
                      <Avatar className='h-10 w-10 border border-slate-100'>
                        <AvatarImage src={selectedUser.profile} alt={selectedUser.username} />
                        <AvatarFallback className='bg-rose-100 text-rose-700'>{selectedUser.username[0]}</AvatarFallback>
                      </Avatar>
                      {selectedUser.status === 'online' && (
                        <span className='absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500' />
                      )}
                    </div>

                    <div className='flex flex-col'>
                      <h2 className='text-base font-bold text-slate-900'>{selectedUser.fullName}</h2>
                      <span className='text-xs font-medium text-green-500'>
                        {selectedUser.status === 'online' ? 'Online' : 'Last seen ' + format(new Date(), 'HH:mm')}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-9 w-9 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      onClick={() => setShowChatSearch(!showChatSearch)}
                    >
                      <SearchIcon size={20} />
                    </Button>
                    <Button size='icon' variant='ghost' className='hidden h-9 w-9 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:flex'>
                      <Video size={20} />
                    </Button>
                    <Button size='icon' variant='ghost' className='hidden h-9 w-9 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:flex'>
                      <Phone size={20} />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size='icon' variant='ghost' className='h-9 w-9 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600'>
                          <MoreVertical size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-48 rounded-xl'>
                        <DropdownMenuItem className='flex gap-2 py-2.5' onClick={() => setEditUsernameOpen(true)}>
                          <UserCircle size={16} /> Edit My Username
                        </DropdownMenuItem>
                        <DropdownMenuItem className='flex gap-2 py-2.5'>
                          <Pin size={16} /> Pin Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem className='flex gap-2 py-2.5'>
                          <Archive size={16} /> Archive Chat
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='flex gap-2 py-2.5'>
                          <VolumeX size={16} /> Mute Notifications
                        </DropdownMenuItem>
                        <DropdownMenuItem className='flex gap-2 py-2.5'>
                          <UserX size={16} /> Block User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='flex gap-2 py-2.5 text-rose-600 focus:bg-rose-50 focus:text-rose-700'
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          <Trash2 size={16} /> Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {showChatSearch && (
                  <div className='px-6 pb-4'>
                    <div className='relative'>
                      <SearchIcon size={14} className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400' />
                      <input
                        type='text'
                        autoFocus
                        placeholder='Search in this chat...'
                        className='h-9 w-full rounded-lg bg-slate-100 pl-9 pr-4 text-sm outline-none'
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Messages */}
              <div className='flex-1 overflow-hidden bg-slate-50/30'>
                <ScrollArea className='h-full px-6 py-6' viewportRef={scrollRef}>
                  <div className='flex flex-col-reverse gap-6'>
                    {currentMessageGroups &&
                      Object.keys(currentMessageGroups).map((date) => (
                        <div key={date} className='flex flex-col gap-4'>
                          <div className='flex items-center gap-4 py-2'>
                            <div className='h-[1px] flex-1 bg-slate-200/60' />
                            <span className='text-[11px] font-bold tracking-wider text-slate-400 uppercase'>
                              {date}
                            </span>
                            <div className='h-[1px] flex-1 bg-slate-200/60' />
                          </div>

                          <div className='flex flex-col gap-3'>
                            {currentMessageGroups[date].slice().reverse().map((msg, idx) => {
                              const isMe = msg.sender === 'You'
                              return (
                                <div
                                  key={`${msg.timestamp}-${idx}`}
                                  className={cn(
                                    'group flex w-full flex-col',
                                    isMe ? 'items-end' : 'items-start'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm md:max-w-[70%]',
                                      isMe
                                        ? 'rounded-tr-none bg-rose-600 text-white shadow-rose-200'
                                        : 'rounded-tl-none bg-white text-slate-800 ring-1 ring-slate-100'
                                    )}
                                  >
                                    {msg.message.startsWith('data:image') ? (
                                      <div className='overflow-hidden rounded-lg'>
                                        <img src={msg.message} alt='Sent' className='max-h-80 w-full object-cover' />
                                      </div>
                                    ) : msg.message.startsWith('Attachment: ') ? (
                                      <div className={cn(
                                        'flex items-center gap-3 rounded-xl p-2 transition-colors',
                                        isMe ? 'bg-rose-500/50' : 'bg-slate-100'
                                      )}>
                                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white'>
                                          <Paperclip size={20} className={isMe ? 'text-white' : 'text-slate-500'} />
                                        </div>
                                        <div className='flex flex-col overflow-hidden'>
                                          <span className='truncate text-[13px] font-medium'>
                                            {msg.message.replace('Attachment: ', '')}
                                          </span>
                                          <span className='text-[10px] opacity-70'>2.4 MB • PDF</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className='whitespace-pre-wrap leading-relaxed'>{msg.message}</p>
                                    )}
                                    <div className={cn(
                                      'mt-1 flex items-center justify-end gap-1.5 text-[10px]',
                                      isMe ? 'text-white/70' : 'text-slate-400'
                                    )}>
                                      {format(new Date(msg.timestamp), 'HH:mm')}
                                      {isMe && <span className='text-[12px]'>✓✓</span>}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Chat Input */}
              <div className='border-t border-slate-100 p-4 md:p-6'>
                <form
                  className='flex items-end gap-3'
                  onSubmit={handleSubmitText}
                >
                  <div className='flex flex-1 items-center gap-2 rounded-2xl bg-slate-100 p-1.5 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-500/20'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-10 w-10 rounded-xl text-slate-500 hover:bg-slate-200/50'
                      onClick={handlePickFile}
                    >
                      <Plus className='h-5 w-5' />
                    </Button>

                    <input
                      type='text'
                      placeholder='Write a message...'
                      className='h-10 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-slate-400'
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />

                    <div className='flex items-center gap-1'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-10 w-10 rounded-xl text-slate-500 hover:bg-slate-200/50'
                        onClick={handlePickImage}
                      >
                        <ImagePlus className='h-5 w-5' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-10 w-10 rounded-xl text-slate-500 hover:bg-slate-200/50'
                        onClick={handlePickFile}
                      >
                        <Paperclip className='h-5 w-5' />
                      </Button>
                    </div>
                  </div>

                  <Button
                    type='submit'
                    size='icon'
                    className='h-[52px] w-[52px] shrink-0 rounded-2xl bg-rose-600 shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 hover:shadow-rose-300 active:scale-95 disabled:opacity-50'
                    disabled={!messageText.trim()}
                  >
                    <Send className='h-5 w-5' />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            /* No Chat Selected State */
            <div className='hidden flex-1 flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 md:flex'>
              <div className='flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-rose-500'>
                <MessagesSquare className='h-12 w-12' />
              </div>
              <h2 className='mt-6 text-xl font-bold text-slate-900'>Your messages</h2>
              <p className='mt-2 text-slate-500'>Select a chat to start messaging or create a new one.</p>
              <Button
                onClick={() => setCreateConversationDialog(true)}
                className='mt-8 rounded-xl bg-rose-600 px-8 py-6 text-base font-semibold shadow-lg shadow-rose-200 hover:bg-rose-700'
              >
                Send Message
              </Button>
            </div>
          )}
        </section>

        {/* Dialogs and Inputs */}
        <NewChat
          users={users}
          onOpenChange={setCreateConversationDialog}
          open={createConversationDialogOpened}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className='rounded-2xl'>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All messages in this conversation will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='rounded-xl'>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteChat}
                className='rounded-xl bg-rose-600 hover:bg-rose-700'
              >
                Delete Chat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={editUsernameOpen} onOpenChange={setEditUsernameOpen}>
          <DialogContent className='rounded-2xl sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Edit Username</DialogTitle>
            </DialogHeader>
            <div className='flex flex-col gap-4 py-4'>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-slate-700'>New Username</label>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder='Enter new username'
                  className='rounded-xl'
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setEditUsernameOpen(false)} className='rounded-xl'>Cancel</Button>
              <Button onClick={handleUpdateUsername} className='rounded-xl bg-rose-600 hover:bg-rose-700'>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <input
          ref={imageInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              const result = reader.result
              if (typeof result === 'string') {
                handleSendMessage({ message: result })
                toast.success('Image sent')
              }
            }
            reader.readAsDataURL(file)
            e.target.value = ''
          }}
        />

        <input
          ref={fileInputRef}
          type='file'
          className='hidden'
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            handleSendMessage({ message: `Attachment: ${file.name}` })
            toast.success('File sent')
            e.target.value = ''
          }}
        />
      </Main>
    </>
  )
}
