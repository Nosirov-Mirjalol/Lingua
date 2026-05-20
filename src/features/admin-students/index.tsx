import React, { useEffect, useState, useRef } from 'react'
import { Link } from '@tanstack/react-router'
<<<<<<< HEAD
import {
  Edit,
  Eye,
  BellRing,
  Loader2,
  Plus,
  Search,
  Send,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react'
=======
import { Edit, Eye, Plus, Search, Trash2, User as UserIcon, X } from 'lucide-react'
>>>>>>> f625b1e03f99fb0e9fc0ac9a0f170c64aebab351
import { toast } from 'sonner'
import {
  extractNationalNine,
  getStudentApiErrorMessage,
} from '@/api/service/admin/student.service'
import type { User } from '@/api/service/teacher/user.type'
import { useAdminStudents } from '@/hooks/admin/students/useAdminStudents'
import {
  getCreateStudentErrorMessage,
  useCreateAdminStudent,
} from '@/hooks/admin/students/useCreateAdminStudent'
import { useDeleteAdminStudent } from '@/hooks/admin/students/useDeleteAdminStudent'
import { useUpdateAdminStudent } from '@/hooks/admin/students/useUpdateAdminStudent'
import { useBroadcastList, useSendBroadcast } from '@/features/notifications/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoseButton } from '@/components/ui/rose-button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ListPagination } from '@/components/list-pagination'
import { ThemeSwitch } from '@/components/theme-switch'

interface StudentFormData {
  username: string
  email: string
  first_name: string
  last_name: string
  phone: string
  password: string
  is_active: boolean
}

type StudentNotificationForm = {
  title: string
  message: string
  type: 'info' | 'warning' | 'error'
}

const getInitialFormData = (): StudentFormData => ({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  phone: '+998',
  password: '',
  is_active: true,
})

const formatPhone = (value: string): string => {
  if (!value.startsWith('+998')) return '+998'
  const digits = value.slice(4).replace(/\D/g, '').slice(0, 9)
  let formatted = '+998'
  if (digits.length > 0) formatted += ' ' + digits.slice(0, 2)
  if (digits.length > 2) formatted += ' ' + digits.slice(2, 5)
  if (digits.length > 5) formatted += ' ' + digits.slice(5, 7)
  if (digits.length > 7) formatted += ' ' + digits.slice(7, 9)
  return formatted
}

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data: students = [], isLoading, isError, totalCount } = useAdminStudents(search, page, pageSize)

  useEffect(() => {
    if (isError) toast.error("API ulanishda xatolik! Studentlarni yuklab bo'lmadi.")
  }, [isError])

  const createMutation = useCreateAdminStudent()
  const deleteMutation = useDeleteAdminStudent()
<<<<<<< HEAD
  const { data: broadcastNotifications = [], isLoading: notificationsLoading } =
    useBroadcastList()
  const sendBroadcastMutation = useSendBroadcast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const [formData, setFormData] = useState<StudentFormData>(getInitialFormData)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Image preview modal state
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  // Action modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<'edit' | 'delete' | 'detail'>(
    'detail'
  )

=======
>>>>>>> f625b1e03f99fb0e9fc0ac9a0f170c64aebab351
  const updateMutation = useUpdateAdminStudent()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState<StudentFormData>(getInitialFormData)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<'edit' | 'delete' | 'detail'>('detail')
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const [editDraft, setEditDraft] = useState({
    username: '',
    first_name: '',
    last_name: '',
    phone: '+998',
    is_active: true,
    email: '',
  })

<<<<<<< HEAD
  const [notificationForm, setNotificationForm] =
    useState<StudentNotificationForm>({
      title: '',
      message: '',
      type: 'info',
    })

  const recentNotifications = Array.isArray(broadcastNotifications)
    ? broadcastNotifications.slice(0, 3)
    : []

  const hasAccessToken = (): boolean => {
    if (typeof window === 'undefined') return false
    return Boolean(
      sessionStorage.getItem('linguapro_access_token') ||
      localStorage.getItem('access_token')
    )
  }

  const handleInputChange = (
    field: keyof StudentFormData,
    value: string | boolean | File | null
  ) => {
=======
  const handleInputChange = (field: keyof StudentFormData, value: string | boolean) => {
>>>>>>> f625b1e03f99fb0e9fc0ac9a0f170c64aebab351
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => setFormData(getInitialFormData())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username.trim()) return toast.error('Username kiritilishi shart')
    if (!formData.email.trim()) return toast.error('Email kiritilishi shart')
    if (!formData.first_name.trim() || !formData.last_name.trim())
      return toast.error("Ism va familiya to'ldirilishi shart")
    if (!formData.password.trim()) return toast.error('Parol kiritilishi shart')
    if (formData.password.trim().length < 8)
      return toast.error("Parol kamida 8 belgi bo'lishi kerak")

    try {
      if (formData.phone && formData.phone !== '+998') extractNationalNine(formData.phone)
    } catch (err) {
      return toast.error((err as Error).message)
    }

    toast.promise(
      createMutation.mutateAsync({
        username: formData.username.trim(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone !== '+998' ? formData.phone : undefined,
        password: formData.password.trim(),
        role: 'student' as const,
      }),
      {
        loading: 'Yaratilmoqda...',
        success: () => {
          setIsCreateOpen(false)
          resetForm()
          return 'Student muvaffaqiyatli yaratildi'
        },
        error: (err) => getCreateStudentErrorMessage(err),
      }
    )
  }

  const openEditModal = (student: User) => {
    setSelectedStudent(student)
    setEditDraft({
      username: student.username ?? '',
      email: student.email ?? '',
      first_name: student.first_name ?? '',
      last_name: student.last_name ?? '',
      phone: student.phone || '+998',
      is_active: Boolean(student.is_active),
    })
    setModalAction('edit')
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedStudent(null)
  }

<<<<<<< HEAD
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasAccessToken()) {
      toast.error('Sessiya topilmadi. Qayta tizimga kiring.')
      return
    }

    if (!formData.username.trim()) {
      toast.error('Username kiritilishi shart')
      return
    }
    if (!formData.email.trim()) {
      toast.error('Email kiritilishi shart')
      return
    }
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error("Ism va familiya to'ldirilishi shart")
      return
    }
    if (!formData.password?.trim()) {
      toast.error('Parol kiritilishi shart')
      return
    }
    if (formData.password.trim().length < 8) {
      toast.error("Parol kamida 8 belgi bo'lishi kerak")
      return
    }

    try {
      if (formData.phone && formData.phone !== '+998') {
        extractNationalNine(formData.phone)
      }
    } catch (err) {
      toast.error((err as Error).message)
      return
    }

    const submitData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone !== '+998' ? formData.phone : undefined,
      password: formData.password.trim(),
      role: 'student' as const,
    }

    toast.promise(createMutation.mutateAsync(submitData), {
      loading: 'Yaratilmoqda...',
      success: () => {
        setIsModalOpen(false)
        resetForm()
        return 'Student muvaffaqiyatli yaratildi'
      },
      error: (err) => getCreateStudentErrorMessage(err),
    })
  }

  const handleSendNotification = () => {
    const title = notificationForm.title.trim()
    const message = notificationForm.message.trim()

    if (!title) {
      toast.error('Notification sarlavhasi kiritilishi shart')
      return
    }

    if (!message) {
      toast.error('Notification matni kiritilishi shart')
      return
    }

    toast.promise(
      sendBroadcastMutation.mutateAsync({
        title,
        message,
        type: notificationForm.type,
      }),
      {
        loading: 'Notification yuborilmoqda...',
        success: () => {
          setIsNotificationModalOpen(false)
          setNotificationForm({ title: '', message: '', type: 'info' })
          return 'Notification studentlarga yuborildi'
        },
        error: 'Notification yuborishda xatolik',
      }
    )
  }

  const handleCancel = () => {
    resetForm()
    setIsModalOpen(false)
  }

  const handleDeleteStudent = (student: User) => {
    setSelectedStudent(student)
    setModalAction('delete')
    setModalOpen(true)
  }

=======
>>>>>>> f625b1e03f99fb0e9fc0ac9a0f170c64aebab351
  const confirmDelete = () => {
    if (!selectedStudent) return
    toast.promise(deleteMutation.mutateAsync(selectedStudent.id), {
      loading: "O'chirilmoqda...",
      success: () => { handleModalClose(); return "Student o'chirildi" },
      error: (err) => getStudentApiErrorMessage(err, "O'chirishda xatolik"),
    })
  }

  const confirmEdit = () => {
    if (!selectedStudent) return
    if (!editDraft.first_name.trim() || !editDraft.last_name.trim())
      return toast.error("Ism va familiya to'ldirilishi shart")
    if (!editDraft.username.trim()) return toast.error('Username kiritilishi shart')

    try {
      if (editDraft.phone && editDraft.phone !== '+998') extractNationalNine(editDraft.phone)
    } catch (err) {
      return toast.error((err as Error).message)
    }

    toast.promise(
      updateMutation.mutateAsync({
        studentId: selectedStudent.id,
        data: {
          username: editDraft.username.trim(),
          first_name: editDraft.first_name.trim(),
          last_name: editDraft.last_name.trim(),
          phone: editDraft.phone,
          is_active: editDraft.is_active,
        },
      }),
      {
        loading: 'Yangilanilmoqda...',
        success: () => { handleModalClose(); return 'Student yangilandi' },
        error: (err) => getStudentApiErrorMessage(err, 'Yangilashda xatolik'),
      }
    )
  }

  const activeCount = students.filter((s) => s.is_active).length
  const inactiveCount = students.filter((s) => !s.is_active).length

  return (
<<<<<<< HEAD
    <SearchProvider>
      <div className='min-h-screen bg-background'>
        <Header>
          <Search className='me-auto' />
          <ThemeSwitch />
          <ConfigDrawer />
        </Header>

        <Main className='bg-background'>
          <div
            style={{
              fontSize: 11,
              color: 'var(--muted-foreground)',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            <Link to='/admin-dashboard'>Dashboard</Link> /{' '}
            <span style={{ color: 'var(--primary)' }}>Students</span>
=======
    <div className='min-h-screen bg-background'>
      <Header>
        <div className='me-auto'>
          <div className='flex items-center gap-2 rounded-2xl border bg-background px-3 py-2 shadow-sm md:w-80'>
            <Search className='h-4 w-4 text-muted-foreground' />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search students...' className='h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0' />
>>>>>>> f625b1e03f99fb0e9fc0ac9a0f170c64aebab351
          </div>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main>
        <p className='mb-4 text-xs font-semibold tracking-wide text-muted-foreground'>
          <Link to='/admin-dashboard'>Dashboard</Link>{' '}
          / <span className='text-primary'>Students</span>
        </p>

        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>Students List</h1>
            <p className='mt-1 text-sm font-medium text-muted-foreground'>
              All students information and payment status
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <RoseButton className='rounded-2xl' onClick={() => { resetForm(); setIsCreateOpen(true) }}>
                <Plus className='mr-2 h-4 w-4' />
                Add Student
              </RoseButton>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg' showCloseButton={false}>
              <div className='flex items-start justify-between px-4 pt-4'>
                <DialogTitle className='text-lg font-semibold'>Add Student</DialogTitle>
                <Button type='button' variant='ghost' size='icon' onClick={() => setIsCreateOpen(false)} className='h-8 w-8 rounded-full'>
                  <X size={16} />
                </Button>
              </div>
<<<<<<< HEAD
              <div className='flex items-center gap-2'>
                <Dialog
                  open={isNotificationModalOpen}
                  onOpenChange={setIsNotificationModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant='outline' className='rounded-2xl'>
                      <BellRing className='mr-2 h-4 w-4' />
                      Notification
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-lg'>
                    <DialogHeader>
                      <DialogTitle>Studentlarga notification yuborish</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='notification-title'>Sarlavha</Label>
                        <Input
                          id='notification-title'
                          value={notificationForm.title}
                          onChange={(e) =>
                            setNotificationForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder='Masalan: Yangi dars jadvali'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='notification-message'>Xabar</Label>
                        <Textarea
                          id='notification-message'
                          value={notificationForm.message}
                          onChange={(e) =>
                            setNotificationForm((prev) => ({
                              ...prev,
                              message: e.target.value,
                            }))
                          }
                          placeholder='Studentlarga ko‘rinadigan xabar matni'
                          rows={5}
                        />
                      </div>
                      <div className='grid grid-cols-3 gap-2'>
                        {(['info', 'warning', 'error'] as const).map((type) => (
                          <Button
                            key={type}
                            type='button'
                            variant={
                              notificationForm.type === type
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() =>
                              setNotificationForm((prev) => ({
                                ...prev,
                                type,
                              }))
                            }
                            className='capitalize'
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                      <div className='rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground'>
                        Bu xabar barcha student foydalanuvchilarga broadcast
                        notification sifatida yuboriladi.
                      </div>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          onClick={() => setIsNotificationModalOpen(false)}
                        >
                          Bekor qilish
                        </Button>
                        <RoseButton
                          onClick={handleSendNotification}
                          disabled={sendBroadcastMutation.isPending}
                        >
                          {sendBroadcastMutation.isPending ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <>
                              <Send className='mr-2 h-4 w-4' />
                              Yuborish
                            </>
                          )}
                        </RoseButton>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <RoseButton
                      className='rounded-2xl'
                      onClick={openCreateModal}
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Add Student
                    </RoseButton>
                  </DialogTrigger>
                <DialogContent
                  className='max-h-[90vh] overflow-y-auto sm:max-w-lg'
                  showCloseButton={false}
                >
                  <div className='flex items-start justify-between px-4 pt-4'>
                    <DialogTitle className='text-lg font-semibold text-foreground'>
                      Add Student
                    </DialogTitle>
                    <button
                      type='button'
                      onClick={() => setIsModalOpen(false)}
                      className='grid h-8 w-8 place-items-center rounded-full bg-muted text-foreground hover:bg-muted/80'
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <form
                    onSubmit={handleSubmit}
                    className='flex flex-col items-center py-4'
                  >
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleFileChange}
                      className='hidden'
                    />

                    {/* Avatar Section */}
                    <div className='mb-4 flex flex-col items-center'>
                      <div
                        className='relative mb-2 cursor-pointer'
                        onClick={handleAvatarClick}
                      >
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt='Avatar'
                            className='h-16 w-16 rounded-full border-2 border-border object-cover'
                          />
                        ) : (
                          <div className='flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted'>
                            <Plus className='h-6 w-6 text-muted-foreground' />
                          </div>
                        )}
                        <div className='absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary'>
                          <Plus className='h-2.5 w-2.5 text-primary-foreground' />
                        </div>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Upload image
                      </p>
                    </div>

                    {/* Form Fields */}
                    <div className='mb-3 grid w-full grid-cols-2 gap-3'>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='first_name'
                          className='text-xs font-medium'
                        >
                          First Name
                        </Label>
                        <Input
                          id='first_name'
                          value={formData.first_name}
                          onChange={(e) =>
                            handleInputChange('first_name', e.target.value)
                          }
                          placeholder='Enter first name'
                          className='h-9'
                          required
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='last_name'
                          className='text-xs font-medium'
                        >
                          Last Name
                        </Label>
                        <Input
                          id='last_name'
                          value={formData.last_name}
                          onChange={(e) =>
                            handleInputChange('last_name', e.target.value)
                          }
                          placeholder='Enter last name'
                          className='h-8'
                          required
                        />
                      </div>
                    </div>

                    <div className='mb-3 w-full space-y-1'>
                      <Label htmlFor='username' className='text-xs font-medium'>
                        Username
                      </Label>
                      <Input
                        id='username'
                        value={formData.username}
                        onChange={(e) =>
                          handleInputChange('username', e.target.value)
                        }
                        placeholder='Enter username'
                        className='h-9'
                        required
                      />
                    </div>

                    <div className='mb-3 w-full space-y-1'>
                      <Label htmlFor='email' className='text-xs font-medium'>
                        Email
                      </Label>
                      <Input
                        id='email'
                        type='email'
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange('email', e.target.value)
                        }
                        placeholder='Enter email'
                        className='h-9'
                        required
                      />
                    </div>

                    <div className='mb-3 w-full space-y-1'>
                      <Label htmlFor='phone' className='text-xs font-medium'>
                        Phone Number
                      </Label>
                      <Input
                        id='phone'
                        value={formData.phone || '+998'}
                        onChange={handlePhoneChange}
                        placeholder='+998 XX XXX XX XX XXX'
                        className='h-9'
                        maxLength={18} // +998 XX XXX XX XX XXX = 18 characters (12 digits + spaces + buffer)
                        required
                      />
                    </div>

                    <div className='mb-3 w-full space-y-1'>
                      <Label htmlFor='password' className='text-xs font-medium'>
                        Password
                      </Label>
                      <Input
                        id='password'
                        type='password'
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange('password', e.target.value)
                        }
                        placeholder='Enter password'
                        className='h-9'
                        required
                      />
                    </div>

                    <div className='mb-4 grid w-full grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label
                          htmlFor='is_active'
                          className='text-xs font-medium'
                        >
                          Status
                        </Label>
                        <div className='flex h-9 items-center space-x-2'>
                          <Switch
                            id='is_active'
                            checked={formData.is_active}
                            onCheckedChange={(checked) =>
                              handleInputChange('is_active', checked)
                            }
                          />
                          <Label
                            htmlFor='is_active'
                            className='text-xs text-gray-600'
                          >
                            Active
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex w-full justify-end space-x-2 border-t pt-3'>
                      <Button
                        type='button'
                        variant='outline'
                        className='px-4 py-2 text-sm'
                        onClick={handleCancel}
                      >
                        Bekor qilish
                      </Button>
                      <RoseButton type='submit' className='px-4 py-2 text-sm'>
                        Saqlash
                      </RoseButton>
                    </div>
                  </form>
                </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className='mb-4 md:hidden'>
            <div className='flex items-center gap-2 rounded-2xl border border-slate-200 bg-background px-3 py-2 shadow-sm dark:border-slate-800'>
              <Search className='h-4 w-4 text-slate-400' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search students...'
                className='h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0'
              />
            </div>
          </div>

          {/* Statistics Cards */}
          <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Yangi
                </CardTitle>
                <div className='h-8 w-8 rounded-full bg-primary/10 p-2'>
                  <Plus className='h-4 w-4 text-primary' />
=======
              <form onSubmit={handleSubmit} className='flex flex-col items-center py-4'>
                <div className='mb-3 grid w-full grid-cols-2 gap-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='first_name' className='text-xs font-medium'>First Name</Label>
                    <Input id='first_name' value={formData.first_name} onChange={(e) => handleInputChange('first_name', e.target.value)} placeholder='Enter first name' className='h-9' required />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='last_name' className='text-xs font-medium'>Last Name</Label>
                    <Input id='last_name' value={formData.last_name} onChange={(e) => handleInputChange('last_name', e.target.value)} placeholder='Enter last name' className='h-9' required />
                  </div>
>>>>>>> f625b1e03f99fb0e9fc0ac9a0f170c64aebab351
                </div>
                <div className='mb-3 w-full space-y-1'>
                  <Label htmlFor='username' className='text-xs font-medium'>Username</Label>
                  <Input id='username' value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} placeholder='Enter username' className='h-9' required />
                </div>
                <div className='mb-3 w-full space-y-1'>
                  <Label htmlFor='email' className='text-xs font-medium'>Email</Label>
                  <Input id='email' type='email' value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder='Enter email' className='h-9' required />
                </div>
                <div className='mb-3 w-full space-y-1'>
                  <Label htmlFor='phone' className='text-xs font-medium'>Phone Number</Label>
                  <Input id='phone' value={formData.phone} onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))} placeholder='+998 XX XXX XX XX' className='h-9' maxLength={18} />
                </div>
                <div className='mb-3 w-full space-y-1'>
                  <Label htmlFor='password' className='text-xs font-medium'>Password</Label>
                  <Input id='password' type='password' value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder='Enter password' className='h-9' required />
                </div>
                <div className='mb-4 w-full space-y-1'>
                  <Label htmlFor='is_active' className='text-xs font-medium'>Status</Label>
                  <div className='flex h-9 items-center space-x-2'>
                    <Switch id='is_active' checked={formData.is_active} onCheckedChange={(checked) => handleInputChange('is_active', checked)} />
                    <Label htmlFor='is_active' className='text-xs text-muted-foreground'>Active</Label>
                  </div>
                </div>
                <div className='flex w-full justify-end space-x-2 border-t pt-3'>
                  <Button type='button' variant='outline' onClick={() => { resetForm(); setIsCreateOpen(false) }}>Bekor qilish</Button>
                  <RoseButton type='submit'>Saqlash</RoseButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

<<<<<<< HEAD
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Faol
                </CardTitle>
                <div className='h-8 w-8 rounded-full bg-primary/10 p-2'>
                  <Plus className='h-4 w-4 text-primary' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-foreground'>
                  {students.filter((s) => s.is_active).length}
                </div>
                <p className='text-xs text-muted-foreground'>Faol studentlar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Nofaol
                </CardTitle>
                <div className='h-8 w-8 rounded-full bg-destructive/10 p-2'>
                  <Plus className='h-4 w-4 text-destructive' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-foreground'>
                  {students.filter((s) => !s.is_active).length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Nofaol studentlar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  O'sish
                </CardTitle>
                <div className='h-8 w-8 rounded-full bg-primary/10 p-2'>
                  <Plus className='h-4 w-4 text-primary' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-foreground'>
                  +{students.length}%
                </div>
                <p className='text-xs text-muted-foreground'>O'sish darajasi</p>
              </CardContent>
            </Card>
          </div>

          <Card className='mb-8 border-primary/10 bg-primary/5'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <BellRing className='h-4 w-4 text-primary' />
                    Student notification markazi
                  </CardTitle>
                  <CardDescription>
                    Studentlarga yuborilgan oxirgi xabarlar va tezkor broadcast.
                  </CardDescription>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsNotificationModalOpen(true)}
                >
                  <Send className='mr-2 h-4 w-4' />
                  Xabar yuborish
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Notificationlar yuklanmoqda...
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className='text-sm text-muted-foreground'>
                  Hali notification yuborilmagan.
                </div>
              ) : (
                <div className='grid gap-3 md:grid-cols-3'>
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className='rounded-xl border bg-background p-3'
                    >
                      <div className='mb-1 flex items-center justify-between gap-2'>
                        <p className='line-clamp-1 text-sm font-semibold'>
                          {notification.title}
                        </p>
                        <Badge variant='secondary' className='text-[10px]'>
                          {notification.is_read ? "O'qilgan" : 'Yangi'}
                        </Badge>
                      </div>
                      <p className='line-clamp-2 text-xs text-muted-foreground'>
                        {notification.message}
                      </p>
                      <p className='mt-2 text-[10px] font-medium text-muted-foreground'>
                        {notification.created_at
                          ? new Date(notification.created_at).toLocaleString(
                              'uz-UZ'
                            )
                          : 'Sana yo‘q'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Students Table */}
=======
        {/* Stats */}
        <div className='mb-8 grid gap-4 sm:grid-cols-3'>
>>>>>>> f625b1e03f99fb0e9fc0ac9a0f170c64aebab351
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Jami</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalCount ?? students.length}</div>
              <p className='text-xs text-muted-foreground'>Jami studentlar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Faol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{activeCount}</div>
              <p className='text-xs text-muted-foreground'>Faol studentlar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Nofaol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{inactiveCount}</div>
              <p className='text-xs text-muted-foreground'>Nofaol studentlar</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Students Table</CardTitle>
            <CardDescription>Total {totalCount ?? students.length} students</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='py-8 text-center text-sm text-muted-foreground'>Yuklanmoqda...</div>
            ) : isError ? (
              <div className='py-8 text-center text-sm text-destructive'>Xatolik yuz berdi</div>
            ) : students.length === 0 ? (
              <div className='py-8 text-center text-sm text-muted-foreground'>Studentlar mavjud emas</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-12'></TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage src={student.avatar || undefined} />
                          <AvatarFallback className='bg-muted text-foreground'>
                            <UserIcon className='h-4 w-4' />
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className='font-medium'>{student.first_name} {student.last_name}</TableCell>
                      <TableCell>@{student.username}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge className={student.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}>
                          {student.is_active ? 'Faol' : 'Nofaol'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end space-x-1'>
                          <Button type='button' variant='ghost' size='sm' onClick={() => { setSelectedStudent(student); setModalAction('detail'); setModalOpen(true) }} aria-label='View'>
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button type='button' variant='ghost' size='sm' onClick={() => openEditModal(student)} aria-label='Edit'>
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button type='button' variant='ghost' size='sm' onClick={() => { setSelectedStudent(student); setModalAction('delete'); setModalOpen(true) }} className='text-destructive hover:bg-destructive/10' aria-label='Delete'>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className='mt-6 flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            {students.length} ta ko'rsatilmoqda
          </p>
          <ListPagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          />
        </div>
      </Main>

      {/* Action Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {modalAction === 'detail' && 'Student Details'}
              {modalAction === 'edit' && 'Edit Student'}
              {modalAction === 'delete' && 'Delete Student'}
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className='space-y-4'>
              {modalAction === 'detail' && (
                <>
                  <div className='flex items-center space-x-4'>
                    <Avatar className='h-16 w-16'>
                      <AvatarImage src={selectedStudent.avatar} />
                      <AvatarFallback className='text-lg'>
                        {selectedStudent.first_name?.[0]}{selectedStudent.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='text-lg font-medium'>
                        {selectedStudent.first_name} {selectedStudent.last_name}
                      </div>
                      <div className='text-sm text-muted-foreground'>@{selectedStudent.username}</div>
                    </div>
                  </div>
                  <div className='grid gap-2'>
                    <div><Label>Email</Label><div className='text-sm'>{selectedStudent.email}</div></div>
                    <div><Label>Phone</Label><div className='text-sm'>{selectedStudent.phone || 'Mavjud emas'}</div></div>
                    <div>
                      <Label>Status</Label>
                      <div className='text-sm'>
                        <Badge variant={selectedStudent.is_active ? 'default' : 'secondary'}>
                          {selectedStudent.is_active ? 'Faol' : 'Nofaol'}
                        </Badge>
                      </div>
                    </div>
                    <div><Label>Role</Label><div className='text-sm'>{selectedStudent.role}</div></div>
                    <div>
                      <Label>Created</Label>
                      <div className='text-sm'>
                        {selectedStudent.created_at
                          ? new Date(selectedStudent.created_at).toLocaleDateString('uz-UZ')
                          : 'Mavjud emas'}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {modalAction === 'delete' && (
                <p className='text-sm text-muted-foreground'>
                  {selectedStudent.first_name} {selectedStudent.last_name} ni o'chirmoqchimisiz?
                </p>
              )}

              {modalAction === 'edit' && (
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='edit-username'>Username</Label>
                    <Input id='edit-username' value={editDraft.username} onChange={(e) => setEditDraft((p) => ({ ...p, username: e.target.value }))} className='mt-1' />
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <Label htmlFor='edit-first-name'>Ism</Label>
                      <Input id='edit-first-name' value={editDraft.first_name} onChange={(e) => setEditDraft((p) => ({ ...p, first_name: e.target.value }))} className='mt-1' />
                    </div>
                    <div>
                      <Label htmlFor='edit-last-name'>Familiya</Label>
                      <Input id='edit-last-name' value={editDraft.last_name} onChange={(e) => setEditDraft((p) => ({ ...p, last_name: e.target.value }))} className='mt-1' />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='edit-phone'>Telefon</Label>
                    <Input id='edit-phone' value={editDraft.phone} onChange={(e) => setEditDraft((p) => ({ ...p, phone: formatPhone(e.target.value) }))} placeholder='+998 90 123 45 67' className='mt-1' />
                  </div>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div>
                      <div className='text-sm font-semibold'>Status</div>
                      <div className='text-xs text-muted-foreground'>{editDraft.is_active ? 'Active' : 'Inactive'}</div>
                    </div>
                    <Switch checked={editDraft.is_active} onCheckedChange={(checked) => setEditDraft((p) => ({ ...p, is_active: checked }))} />
                  </div>
                </div>
              )}

              <div className='flex justify-end space-x-2'>
                <Button variant='outline' onClick={handleModalClose}>Cancel</Button>
                {modalAction === 'delete' && (
                  <Button variant='destructive' onClick={confirmDelete}>Delete</Button>
                )}
                {modalAction === 'edit' && (
                  <RoseButton onClick={confirmEdit} disabled={updateMutation.isPending}>Save</RoseButton>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
