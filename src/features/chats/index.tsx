import { type FormEvent, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import {
  Archive,
  ArrowLeft,
  ImagePlus,
  MoreVertical,
  Paperclip,
  Phone,
  Pin,
  Plus,
  Search as SearchIcon,
  Send,
  Trash2,
  UserCircle,
  UserX,
  Video,
  VolumeX,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChatEmptyState } from '@/components/shared/chat/chat-empty-state'
import { ChatListHeader } from '@/components/shared/chat/chat-list-header'
import { ChatListItem } from '@/components/shared/chat/chat-list-item'
import { ThemeSwitch } from '@/components/theme-switch'
import { GroupCapacityChart } from './components/group-capacity-chart'
import { NewChat } from './components/new-chat'
import { StudentGrowthChart } from './components/student-growth-chart'
import { type ChatUser, type Convo } from './data/chat-types'
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

  const selectedUser = useMemo(
    () =>
      selectedUserId
        ? (chatList.find((u) => u.id === selectedUserId) ?? null)
        : null,
    [selectedUserId, chatList]
  )

  const currentMessageGroups = useMemo(() => {
    if (!selectedUser) return {}

    let messages = selectedUser.messages
    if (showChatSearch && chatSearch.trim()) {
      messages = messages.filter((m) =>
        m.message.toLowerCase().includes(chatSearch.trim().toLowerCase())
      )
    }

    return messages.reduce((acc: Record<string, Convo[]>, obj) => {
      const key = format(new Date(obj.timestamp), 'd MMMM, yyyy')
      if (!acc[key]) acc[key] = []
      acc[key].push(obj)
      return acc
    }, {})
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
    setChatList((prev) => prev.filter((u) => u.id !== selectedUserId))
    setSelectedUserId(null)
    setMobileSelectedUser(null)
    setDeleteDialogOpen(false)
    toast.success('Chat deleted successfully')
  }

  const handleUpdateUsername = () => {
    toast.success(`Username updated to ${newUsername}`)
    setEditUsernameOpen(false)
  }

  const handleStartChat = (users: Partial<ChatUser>[]) => {
    const nextUserId = users[0]?.id
    if (!nextUserId) return

    const nextUser = chatList.find((user) => user.id === nextUserId) ?? null
    setSelectedUserId(nextUserId)
    setMobileSelectedUser(nextUser)
    setCreateConversationDialog(false)
  }

  return (
    <>
      <Header>
        <div className='flex flex-1 items-center gap-4'>
          <div className='relative hidden w-full max-w-md md:block'>
            <SearchIcon
              className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
              size={16}
            />
            <input
              type='search'
              placeholder='Search globally...'
              className='h-9 w-full rounded-lg border bg-muted/50 py-2 pr-4 pl-10 text-sm text-foreground transition-all duration-200 outline-none focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10'
            />
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </Header>

      <Main fixed>
        {/* Dashboard Section */}
        <section className='mb-6 grid gap-6 md:grid-cols-2'>
          <StudentGrowthChart />
          <GroupCapacityChart />
        </section>

        <section className='flex h-full gap-0 md:gap-6'>
          {/* Left Side - Chat List */}
          <div className='flex w-full flex-col gap-4 border-r border-border/50 pr-0 md:w-80 md:pr-2 lg:w-96'>
            <ChatListHeader
              title='Lingua Chat'
              count={chatList.length}
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder='Search people or messages...'
              action={
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setCreateConversationDialog(true)}
                  className='h-10 w-10 rounded-full bg-muted hover:bg-primary/10 hover:text-primary'
                >
                  <Plus size={20} />
                </Button>
              }
            />

            <ScrollArea className='flex-1 px-4 md:px-0'>
              <div className='flex flex-col gap-1 py-2'>
                {filteredChatList.map((chatUsr) => {
                  const { id, profile, messages, fullName, status } = chatUsr
                  const lastConvo = messages[0]
                  const isSelected = selectedUserId === id
                  const lastMsg =
                    lastConvo.sender === 'You'
                      ? `You: ${lastConvo.message}`
                      : lastConvo.message

                  return (
                    <ChatListItem
                      key={id}
                      active={isSelected}
                      avatar={profile}
                      fallback={fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                      title={fullName}
                      preview={lastMsg}
                      time={format(new Date(lastConvo.timestamp), 'HH:mm')}
                      online={status === 'online'}
                      onClick={() => {
                        setSelectedUserId(id)
                        setMobileSelectedUser(chatUsr)
                      }}
                    />
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Chat Content */}
          {selectedUser ? (
            <div
              className={cn(
                'absolute inset-0 z-50 flex flex-1 flex-col bg-background md:static md:z-auto md:rounded-3xl md:border md:bg-card md:shadow-xl md:shadow-border/50',
                !mobileSelectedUser && 'hidden md:flex'
              )}
            >
              {/* Chat Header */}
              <div className='flex flex-col border-b'>
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
                      <Avatar className='h-10 w-10 border'>
                        <AvatarImage
                          src={selectedUser.profile}
                          alt={selectedUser.username}
                        />
                        <AvatarFallback className='bg-primary/10 text-primary'>
                          {selectedUser.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      {selectedUser.status === 'online' && (
                        <span className='absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-background bg-green-500' />
                      )}
                    </div>

                    <div className='flex flex-col'>
                      <h2 className='text-base font-bold text-foreground'>
                        {selectedUser.fullName}
                      </h2>
                      <span className='text-xs font-medium text-green-500'>
                        {selectedUser.status === 'online'
                          ? 'Online'
                          : 'Last seen ' + format(new Date(), 'HH:mm')}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground'
                      onClick={() => setShowChatSearch(!showChatSearch)}
                    >
                      <SearchIcon size={20} />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='hidden h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground sm:flex'
                    >
                      <Video size={20} />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='hidden h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground sm:flex'
                    >
                      <Phone size={20} />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground'
                        >
                          <MoreVertical size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='end'
                        className='w-48 rounded-xl'
                      >
                        <DropdownMenuItem
                          className='flex gap-2 py-2.5'
                          onClick={() => setEditUsernameOpen(true)}
                        >
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
                      <SearchIcon
                        size={14}
                        className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
                      />
                      <input
                        type='text'
                        autoFocus
                        placeholder='Search in this chat...'
                        className='h-9 w-full rounded-lg bg-muted pr-4 pl-9 text-sm outline-none'
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Messages */}
              <div className='flex-1 overflow-hidden bg-muted/30'>
                <ScrollArea
                  className='h-full px-6 py-6'
                  viewportRef={scrollRef}
                >
                  <div className='flex flex-col-reverse gap-6'>
                    {currentMessageGroups &&
                      Object.keys(currentMessageGroups).map((date) => (
                        <div key={date} className='flex flex-col gap-4'>
                          <div className='flex items-center gap-4 py-2'>
                            <div className='h-[1px] flex-1 bg-border' />
                            <span className='text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
                              {date}
                            </span>
                            <div className='h-[1px] flex-1 bg-border' />

                            <div className='h-px flex-1 bg-border' />
                            <span className='text-[11px] font-bold tracking-wider text-muted-foreground uppercase'>
                              {date}
                            </span>
                            <div className='h-px flex-1 bg-border' />
                          </div>

                          <div className='flex flex-col gap-3'>
                            {currentMessageGroups[date]
                              .slice()
                              .reverse()
                              .map((msg, idx) => {
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
                                          ? 'rounded-tr-none bg-primary text-primary-foreground shadow-primary/20'
                                          : 'rounded-tl-none bg-card text-foreground ring-1 ring-border'
                                      )}
                                    >
                                      {msg.message.startsWith('data:image') ? (
                                        <div className='overflow-hidden rounded-lg'>
                                          <img
                                            src={msg.message}
                                            alt='Sent'
                                            className='max-h-80 w-full object-cover'
                                          />
                                        </div>
                                      ) : msg.message.startsWith(
                                          'Attachment: '
                                        ) ? (
                                        <div
                                          className={cn(
                                            'flex items-center gap-3 rounded-xl p-2 transition-colors',
                                            isMe ? 'bg-primary/50' : 'bg-muted'
                                          )}
                                        >
                                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-background/20 text-primary-foreground'>
                                            <Paperclip
                                              size={20}
                                              className={
                                                isMe
                                                  ? 'text-primary-foreground'
                                                  : 'text-muted-foreground'
                                              }
                                            />
                                          </div>
                                          <div className='flex flex-col overflow-hidden'>
                                            <span className='truncate text-[13px] font-medium'>
                                              {msg.message.replace(
                                                'Attachment: ',
                                                ''
                                              )}
                                            </span>
                                            <span className='text-[10px] opacity-70'>
                                              2.4 MB • PDF
                                            </span>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className='leading-relaxed whitespace-pre-wrap'>
                                          {msg.message}
                                        </p>
                                      )}
                                      <div
                                        className={cn(
                                          'mt-1 flex items-center justify-end gap-1.5 text-[10px]',
                                          isMe
                                            ? 'text-primary-foreground/70'
                                            : 'text-muted-foreground'
                                        )}
                                      >
                                        {format(
                                          new Date(msg.timestamp),
                                          'HH:mm'
                                        )}
                                        {isMe && (
                                          <span className='text-[12px]'>
                                            ✓✓
                                          </span>
                                        )}
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
              <div className='border-t p-4 md:p-6'>
                <form
                  className='flex items-end gap-3'
                  onSubmit={handleSubmitText}
                >
                  <div className='flex flex-1 items-center gap-2 rounded-2xl bg-muted p-1.5 transition-all focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted/80'
                      onClick={handlePickFile}
                    >
                      <Plus className='h-5 w-5' />
                    </Button>

                    <input
                      type='text'
                      placeholder='Write a message...'
                      className='h-10 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground'
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />

                    <div className='flex items-center gap-1'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted/80'
                        onClick={handlePickImage}
                      >
                        <ImagePlus className='h-5 w-5' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted/80'
                        onClick={handlePickFile}
                      >
                        <Paperclip className='h-5 w-5' />
                      </Button>
                    </div>
                  </div>

                  <Button
                    type='submit'
                    size='icon'
                    className='h-[52px] w-[52px] shrink-0 rounded-2xl bg-rose-600 shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 hover:shadow-rose-300 active:scale-95 disabled:opacity-50 dark:shadow-none dark:hover:shadow-none'
                    disabled={!messageText.trim()}
                  >
                    <Send className='h-5 w-5' />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            /* No Chat Selected State */
            <ChatEmptyState
              title='Your messages'
              description='Select a chat to start messaging or create a new one.'
              action={
                <Button
                  onClick={() => setCreateConversationDialog(true)}
                  className='mt-8 rounded-xl bg-rose-600 px-8 py-6 text-base font-semibold shadow-lg shadow-rose-200 hover:bg-rose-700 dark:shadow-none'
                >
                  Send Message
                </Button>
              }
            />
          )}
        </section>

        {/* Dialogs and Inputs */}
        <NewChat
          users={users}
          onOpenChange={setCreateConversationDialog}
          open={createConversationDialogOpened}
          onStartChat={handleStartChat}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className='rounded-2xl'>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All messages in this conversation
                will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='rounded-xl'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteChat}
                className='rounded-xl bg-destructive hover:bg-destructive/90'
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
                <label className='text-sm font-medium text-foreground'>
                  New Username
                </label>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder='Enter new username'
                  className='rounded-xl'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setEditUsernameOpen(false)}
                className='rounded-xl'
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUsername}
                className='rounded-xl bg-primary hover:bg-primary/90'
              >
                Save Changes
              </Button>
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
