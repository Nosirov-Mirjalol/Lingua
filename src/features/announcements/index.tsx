import { useEffect, useMemo, useState } from 'react'
import { Calendar, Clock, Edit, Megaphone, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoseButton } from '@/components/ui/rose-button'
import { Textarea } from '@/components/ui/textarea'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

type Priority = 'normal' | 'high'

type Announcement = {
  id: string
  title: string
  content: string
  priority: Priority
  createdAt: string
}

const announcementsStorageKey = 'linguapro_announcements'

const defaultAnnouncements: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Midterm Exam Schedule',
    content:
      'The midterm exams will be held from May 5th to May 10th. Please review the syllabus for detailed schedule and topics covered.',
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ann_2',
    title: 'Extra Office Hours',
    content:
      'I will be available for additional office hours this Friday from 2 PM to 5 PM. Feel free to drop by if you need help with any topics.',
    priority: 'normal',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
]

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
  const time = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return { date, time }
}

export default function AnnouncementsPage() {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const raw = localStorage.getItem(announcementsStorageKey)
      if (!raw) return defaultAnnouncements
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return defaultAnnouncements
      return parsed as Announcement[]
    } catch {
      return defaultAnnouncements
    }
  })

  useEffect(() => {
    localStorage.setItem(announcementsStorageKey, JSON.stringify(announcements))
  }, [announcements])

  const sortedAnnouncements = useMemo(() => {
    return [...announcements].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority === 'high' ? -1 : 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [announcements])

  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setContent('')
    setPriority('normal')
  }

  const handleOpenCreate = () => {
    resetForm()
    setOpen(true)
  }

  const handleOpenEdit = (ann: Announcement) => {
    setEditingId(ann.id)
    setTitle(ann.title)
    setContent(ann.content)
    setPriority(ann.priority)
    setOpen(true)
  }

  const handleSave = () => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle || !trimmedContent) return

    if (editingId) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                title: trimmedTitle,
                content: trimmedContent,
                priority,
              }
            : a
        )
      )
    } else {
      const newAnn: Announcement = {
        id: `ann_${Date.now()}`,
        title: trimmedTitle,
        content: trimmedContent,
        priority,
        createdAt: new Date().toISOString(),
      }
      setAnnouncements((prev) => [newAnn, ...prev])
    }

    setOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (!window.confirm("E'lonni o'chirmoqchimisiz?")) return
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
              E'lonlar
            </h1>
            <p className='text-muted-foreground'>
              Admin e'lonlarni kiritishi, tahrirlashi va o'chirishi mumkin.
            </p>
          </div>
          <RoseButton onClick={handleOpenCreate} className='gap-2'>
            <Plus className='h-4 w-4' />
            Yangi e'lon
          </RoseButton>
        </div>

        <div className='mt-6 space-y-4'>
          {sortedAnnouncements.map((announcement) => {
            const { date, time } = formatDateTime(announcement.createdAt)
            return (
              <div
                key={announcement.id}
                className='rounded-2xl border bg-card p-6 shadow-sm'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex flex-1 gap-4'>
                    <div
                      className={
                        'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ' +
                        (announcement.priority === 'high'
                          ? 'bg-rose-600'
                          : 'bg-rose-50 dark:bg-rose-950/40')
                      }
                    >
                      <Megaphone
                        className={
                          'h-6 w-6 ' +
                          (announcement.priority === 'high'
                            ? 'text-white'
                            : 'text-rose-600')
                        }
                      />
                    </div>

                    <div className='flex-1'>
                      <div className='mb-2 flex flex-wrap items-center gap-3'>
                        <h3 className='text-lg font-bold text-foreground'>
                          {announcement.title}
                        </h3>
                        {announcement.priority === 'high' && (
                          <Badge className='bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300'>
                            Muhim
                          </Badge>
                        )}
                      </div>
                      <p className='text-sm leading-relaxed text-muted-foreground'>
                        {announcement.content}
                      </p>

                      <div className='mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-rose-500' />
                          <span>{date}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Clock className='h-4 w-4 text-rose-500' />
                          <span>{time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => handleOpenEdit(announcement)}
                      className='h-9 w-9'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <RoseButton
                      roseVariant='ghost'
                      roseSize='sm'
                      onClick={() => handleDelete(announcement.id)}
                      className='h-9 w-9'
                    >
                      <Trash2 className='h-4 w-4' />
                    </RoseButton>
                  </div>
                </div>
              </div>
            )
          })}

          {sortedAnnouncements.length === 0 && (
            <div className='rounded-2xl border bg-card p-10 text-center'>
              <p className='text-sm text-muted-foreground'>
                Hozircha e'lon yo'q.
              </p>
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className='sm:max-w-[560px]'>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "E'lonni tahrirlash" : "Yangi e'lon"}
              </DialogTitle>
            </DialogHeader>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='announcement-title'>Sarlavha</Label>
                <Input
                  id='announcement-title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Masalan: Bugungi dars jadvali'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='announcement-content'>Matn</Label>
                <Textarea
                  id='announcement-content'
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="E'lon matni..."
                  className='min-h-28'
                />
              </div>

              <div className='space-y-2'>
                <Label>Daraja</Label>
                <div className='flex gap-2'>
                  <RoseButton
                    type='button'
                    roseVariant={priority === 'normal' ? 'solid' : 'outline'}
                    onClick={() => setPriority('normal')}
                  >
                    Oddiy
                  </RoseButton>
                  <RoseButton
                    type='button'
                    roseVariant={priority === 'high' ? 'solid' : 'outline'}
                    onClick={() => setPriority('high')}
                  >
                    Muhim
                  </RoseButton>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setOpen(false)
                  resetForm()
                }}
              >
                Bekor qilish
              </Button>
              <RoseButton type='button' onClick={handleSave}>
                Saqlash
              </RoseButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
