import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { mockNotifications, type Notification } from '@/data/notifications-data'
import { uz } from 'date-fns/locale'
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellRing,
  CheckCheck,
  CheckCircle,
  Edit,
  Eye,
  Filter,
  Info,
  Plus,
  Trash2,
} from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoseButton } from '@/components/ui/rose-button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterRecipient, setFilterRecipient] = useState<string>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  )
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null)
  const [viewingNotification, setViewingNotification] =
    useState<Notification | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState<
    string | null
  >(null)

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    priority: 'medium' as Notification['priority'],
    recipient: 'all' as Notification['recipient'],
    actionUrl: '',
    actionText: '',
  })

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || notification.type === filterType
    const matchesPriority =
      filterPriority === 'all' || notification.priority === filterPriority
    const matchesRecipient =
      filterRecipient === 'all' || notification.recipient === filterRecipient

    return matchesSearch && matchesType && matchesPriority && matchesRecipient
  })

  // Stats
  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    byType: {
      info: notifications.filter((n) => n.type === 'info').length,
      success: notifications.filter((n) => n.type === 'success').length,
      warning: notifications.filter((n) => n.type === 'warning').length,
      error: notifications.filter((n) => n.type === 'error').length,
    },
  }

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notifications')
    if (saved) {
      const parsed = JSON.parse(saved) as Notification[]
      const notificationsWithDates = parsed.map((n) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }))
      setNotifications(notificationsWithDates)
    }
  }, [])

  const handleCreateNotification = () => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      title: formData.title,
      message: formData.message,
      type: formData.type,
      priority: formData.priority,
      recipient: formData.recipient,
      sender: 'Admin',
      senderAvatar: '/src/assets/favicon.png',
      timestamp: new Date(),
      read: false,
      actionUrl: formData.actionUrl || undefined,
      actionText: formData.actionText || undefined,
    }

    setNotifications([newNotification, ...notifications])
    setIsCreateModalOpen(false)
    resetForm()
  }

  const handleUpdateNotification = () => {
    if (!editingNotification) return

    const updatedNotifications = notifications.map((notification) =>
      notification.id === editingNotification.id
        ? {
            ...notification,
            title: formData.title,
            message: formData.message,
            type: formData.type,
            priority: formData.priority,
            recipient: formData.recipient,
            actionUrl: formData.actionUrl || undefined,
            actionText: formData.actionText || undefined,
          }
        : notification
    )

    setNotifications(updatedNotifications)
    setIsEditModalOpen(false)
    setEditingNotification(null)
    resetForm()
  }

  const handleDeleteNotification = (id: string) => {
    setNotificationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (notificationToDelete) {
      setNotifications(
        notifications.filter((n) => n.id !== notificationToDelete)
      )
      setDeleteDialogOpen(false)
      setNotificationToDelete(null)
    }
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const handleMarkAsUnread = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: false } : notification
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id))
    }
  }

  const handleBulkDelete = () => {
    setNotifications(
      notifications.filter((n) => !selectedNotifications.includes(n.id))
    )
    setSelectedNotifications([])
  }

  const openEditModal = (notification: Notification) => {
    setEditingNotification(notification)
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      recipient: notification.recipient,
      actionUrl: notification.actionUrl || '',
      actionText: notification.actionText || '',
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (notification: Notification) => {
    setViewingNotification(notification)
    setIsViewModalOpen(true)
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      recipient: 'all',
      actionUrl: '',
      actionText: '',
    })
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className='h-4 w-4 text-blue-500' />
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-500' />
      case 'warning':
        return <AlertTriangle className='h-4 w-4 text-yellow-500' />
      case 'error':
        return <AlertCircle className='h-4 w-4 text-red-500' />
      default:
        return <Bell className='h-4 w-4' />
    }
  }

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant='destructive'>Yuqori</Badge>
      case 'medium':
        return <Badge className='bg-yellow-500 text-white'>Oʻrta</Badge>
      case 'low':
        return <Badge variant='secondary'>Past</Badge>
      default:
        return <Badge variant='outline'>Nomaʻlum</Badge>
    }
  }

  const getRecipientBadge = (recipient: Notification['recipient']) => {
    switch (recipient) {
      case 'all':
        return <Badge variant='outline'>Barchasi</Badge>
      case 'students':
        return <Badge className='bg-blue-500 text-white'>Oʻquvchilar</Badge>
      case 'teachers':
        return <Badge className='bg-green-500 text-white'>Oʻqituvchilar</Badge>
      case 'admins':
        return <Badge className='bg-purple-500 text-white'>Adminlar</Badge>
      default:
        return <Badge variant='outline'>Nomaʻlum</Badge>
    }
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
              Bildirishlar
            </h1>
            <p className='text-muted-foreground'>
              Barcha bildirishlarni boshqarish, yaratish va o'chirish.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={handleMarkAllAsRead}
              variant='outline'
              className='flex items-center gap-2'
            >
              <CheckCheck className='h-4 w-4' />
              Barchasini o'qilgan deb belgilash
            </Button>
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <RoseButton className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Yangi bildirishma
                </RoseButton>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[560px]'>
                <DialogHeader>
                  <DialogTitle>Yangi bildirishma yaratish</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='title'>Sarlavha</Label>
                    <Input
                      id='title'
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder='Bildirishma sarlavhasi'
                    />
                  </div>
                  <div>
                    <Label htmlFor='message'>Xabar matni</Label>
                    <Textarea
                      id='message'
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder='Bildirishma matni'
                      rows={4}
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label>Turi</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            type: value as Notification['type'],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='info'>Ma'lumot</SelectItem>
                          <SelectItem value='success'>Muvaffaqiyat</SelectItem>
                          <SelectItem value='warning'>Ogohlantirish</SelectItem>
                          <SelectItem value='error'>Xatolik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Muhimlik darajasi</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            priority: value as Notification['priority'],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='low'>Past</SelectItem>
                          <SelectItem value='medium'>O'rta</SelectItem>
                          <SelectItem value='high'>Yuqori</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Qabul qiluvchilar</Label>
                    <Select
                      value={formData.recipient}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          recipient: value as Notification['recipient'],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>Barchasi</SelectItem>
                        <SelectItem value='students'>O'quvchilar</SelectItem>
                        <SelectItem value='teachers'>O'qituvchilar</SelectItem>
                        <SelectItem value='admins'>Adminlar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='actionUrl'>Havola (ixtiyoriy)</Label>
                      <Input
                        id='actionUrl'
                        value={formData.actionUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            actionUrl: e.target.value,
                          })
                        }
                        placeholder='/courses'
                      />
                    </div>
                    <div>
                      <Label htmlFor='actionText'>
                        Tugma matni (ixtiyoriy)
                      </Label>
                      <Input
                        id='actionText'
                        value={formData.actionText}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            actionText: e.target.value,
                          })
                        }
                        placeholder="Kursni ko'rish"
                      />
                    </div>
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      Bekor qilish
                    </Button>
                    <RoseButton onClick={handleCreateNotification}>
                      Yaratish
                    </RoseButton>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Jami
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                O'qilmagan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {stats.unread}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Ma'lumot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.byType.info}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Xatolik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {stats.byType.error}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Filter className='h-4 w-4' />
              Filtrlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-4'>
              <div className='min-w-[200px] flex-1'>
                <Input
                  placeholder='Qidirish...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full'
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className='w-[150px]'>
                  <SelectValue placeholder='Turi' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Barcha turlar</SelectItem>
                  <SelectItem value='info'>Ma'lumot</SelectItem>
                  <SelectItem value='success'>Muvaffaqiyat</SelectItem>
                  <SelectItem value='warning'>Ogohlantirish</SelectItem>
                  <SelectItem value='error'>Xatolik</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className='w-[150px]'>
                  <SelectValue placeholder='Muhimlik' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Barcha darajalar</SelectItem>
                  <SelectItem value='high'>Yuqori</SelectItem>
                  <SelectItem value='medium'>O'rta</SelectItem>
                  <SelectItem value='low'>Past</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterRecipient}
                onValueChange={setFilterRecipient}
              >
                <SelectTrigger className='w-[150px]'>
                  <SelectValue placeholder='Qabul qiluvchi' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Barchasi</SelectItem>
                  <SelectItem value='students'>O'quvchilar</SelectItem>
                  <SelectItem value='teachers'>O'qituvchilar</SelectItem>
                  <SelectItem value='admins'>Adminlar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <Card className='border-blue-200 bg-blue-50'>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    checked={
                      selectedNotifications.length ===
                      filteredNotifications.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <span className='text-sm'>
                    {selectedNotifications.length} ta bildirishma tanlandi
                  </span>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setSelectedNotifications([])}
                  >
                    Tanlashni bekor qilish
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={handleBulkDelete}
                    className='flex items-center gap-2'
                  >
                    <Trash2 className='h-4 w-4' />
                    Tanlanganlarni o'chirish
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <BellRing className='h-4 w-4' />
                Bildirishlar ro'yxati ({filteredNotifications.length})
              </CardTitle>
              <div className='flex items-center gap-2'>
                <Checkbox
                  checked={
                    selectedNotifications.length ===
                    filteredNotifications.length
                  }
                  onCheckedChange={handleSelectAll}
                />
                <span className='text-sm text-muted-foreground'>
                  Barchasini tanlash
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className='h-[1000px] pb-4'>
              <div className='space-y-2'>
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-lg border p-3 transition-all hover:shadow-md ${
                      notification.read
                        ? 'bg-card'
                        : 'border-blue-200 bg-blue-50 dark:bg-blue-950'
                    }`}
                  >
                    <div className='flex items-start gap-3'>
                      <Checkbox
                        checked={selectedNotifications.includes(
                          notification.id
                        )}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNotifications([
                              ...selectedNotifications,
                              notification.id,
                            ])
                          } else {
                            setSelectedNotifications(
                              selectedNotifications.filter(
                                (id) => id !== notification.id
                              )
                            )
                          }
                        }}
                      />
                      <div className='flex-1'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='mb-1 flex items-center gap-2'>
                              {getNotificationIcon(notification.type)}
                              <h3
                                className={`text-sm font-semibold ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}
                              >
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className='h-2 w-2 rounded-full bg-blue-500' />
                              )}
                            </div>
                            <p className='mb-2 line-clamp-2 text-sm text-muted-foreground'>
                              {notification.message}
                            </p>
                            <div className='mb-2 flex items-center gap-2'>
                              {getPriorityBadge(notification.priority)}
                              {getRecipientBadge(notification.recipient)}
                              <span className='text-xs text-muted-foreground'>
                                {format(
                                  notification.timestamp,
                                  'dd MMMM yyyy, HH:mm',
                                  { locale: uz }
                                )}
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <span className='text-xs text-muted-foreground'>
                                Yuboruvchi: {notification.sender}
                              </span>
                            </div>
                            {notification.actionUrl &&
                              notification.actionText && (
                                <div className='mt-3'>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() =>
                                      window.open(
                                        notification.actionUrl,
                                        '_blank'
                                      )
                                    }
                                    className='text-xs'
                                  >
                                    {notification.actionText}
                                  </Button>
                                </div>
                              )}
                          </div>
                          <div className='flex items-center gap-1'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => openViewModal(notification)}
                              className='h-8 w-8 p-0'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => openEditModal(notification)}
                              className='h-8 w-8 p-0'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            {notification.read ? (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  handleMarkAsUnread(notification.id)
                                }
                                className='h-8 w-8 p-0'
                              >
                                <Mail className='h-4 w-4' />
                              </Button>
                            ) : (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                className='h-8 w-8 p-0'
                              >
                                <MailOpen className='h-4 w-4' />
                              </Button>
                            )}
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleDeleteNotification(notification.id)
                              }
                              className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredNotifications.length === 0 && (
                  <div className='py-8 text-center'>
                    <Bell className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                    <p className='text-gray-500'>Bildirishmalar topilmadi</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className='sm:max-w-[560px]'>
            <DialogHeader>
              <DialogTitle>Bildirishmani tahrirlash</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='edit-title'>Sarlavha</Label>
                <Input
                  id='edit-title'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder='Bildirishma sarlavhasi'
                />
              </div>
              <div>
                <Label htmlFor='edit-message'>Xabar matni</Label>
                <Textarea
                  id='edit-message'
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder='Bildirishma matni'
                  rows={4}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Turi</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        type: value as Notification['type'],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='info'>Ma'lumot</SelectItem>
                      <SelectItem value='success'>Muvaffaqiyat</SelectItem>
                      <SelectItem value='warning'>Ogohlantirish</SelectItem>
                      <SelectItem value='error'>Xatolik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Muhimlik darajasi</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        priority: value as Notification['priority'],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='low'>Past</SelectItem>
                      <SelectItem value='medium'>O'rta</SelectItem>
                      <SelectItem value='high'>Yuqori</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Qabul qiluvchilar</Label>
                <Select
                  value={formData.recipient}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      recipient: value as Notification['recipient'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Barchasi</SelectItem>
                    <SelectItem value='students'>O'quvchilar</SelectItem>
                    <SelectItem value='teachers'>O'qituvchilar</SelectItem>
                    <SelectItem value='admins'>Adminlar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='edit-actionUrl'>Havola (ixtiyoriy)</Label>
                  <Input
                    id='edit-actionUrl'
                    value={formData.actionUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, actionUrl: e.target.value })
                    }
                    placeholder='/courses'
                  />
                </div>
                <div>
                  <Label htmlFor='edit-actionText'>
                    Tugma matni (ixtiyoriy)
                  </Label>
                  <Input
                    id='edit-actionText'
                    value={formData.actionText}
                    onChange={(e) =>
                      setFormData({ ...formData, actionText: e.target.value })
                    }
                    placeholder="Kursni ko'rish"
                  />
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Bekor qilish
                </Button>
                <RoseButton onClick={handleUpdateNotification}>
                  Saqlash
                </RoseButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className='sm:max-w-[560px]'>
            <DialogHeader>
              <DialogTitle>Bildirishma tafsilotlari</DialogTitle>
            </DialogHeader>
            {viewingNotification && (
              <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                  {getNotificationIcon(viewingNotification.type)}
                  <h3 className='text-lg font-semibold'>
                    {viewingNotification.title}
                  </h3>
                </div>
                <p className='text-gray-600'>{viewingNotification.message}</p>
                <div className='flex items-center gap-2'>
                  {getPriorityBadge(viewingNotification.priority)}
                  {getRecipientBadge(viewingNotification.recipient)}
                </div>
                <div className='text-sm text-gray-500'>
                  <p>Yuboruvchi: {viewingNotification.sender}</p>
                  <p>
                    Vaqti:{' '}
                    {format(
                      viewingNotification.timestamp,
                      'dd MMMM yyyy, HH:mm',
                      { locale: uz }
                    )}
                  </p>
                </div>
                {viewingNotification.actionUrl &&
                  viewingNotification.actionText && (
                    <Button
                      variant='outline'
                      onClick={() =>
                        window.open(viewingNotification.actionUrl, '_blank')
                      }
                    >
                      {viewingNotification.actionText}
                    </Button>
                  )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bildirishmani o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Ushbu bildirishmani o'chirishga ishonchingiz komilmi? Bu amal
                ortga qaytarib bo'lmaydi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className='bg-red-600 hover:bg-red-700'
              >
                O'chirish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Main>
    </>
  )
}

// Missing icons
const Mail = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    />
  </svg>
)

const MailOpen = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76'
    />
  </svg>
)
