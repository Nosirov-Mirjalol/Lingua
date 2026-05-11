import React, { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/api/service/teacher/user.type'
import { SearchProvider } from '@/context/search-provider'
import { useAdminStudents } from '@/hooks/admin/students/useAdminStudents'
import { useCreateAdminStudent } from '@/hooks/admin/students/useCreateAdminStudent'
import { useDeleteAdminStudent } from '@/hooks/admin/students/useDeleteAdminStudent'
import { useUpdateAdminStudent } from '@/hooks/admin/students/useUpdateAdminStudent'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
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
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

interface StudentFormData {
  username: string
  email: string
  first_name: string
  last_name: string
  phone: string
  password: string
  role: 'student'
  is_active: boolean
  avatar?: File | null
}

const getInitialFormData = (): StudentFormData => ({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  phone: '+998',
  password: '',
  role: 'student',
  is_active: true,
  avatar: null,
})

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('')
  const { data: students = [], isLoading, isError } = useAdminStudents(search)

  // Show error toast if API fails
  useEffect(() => {
    if (isError) {
      toast.error("API ulanishda xatolik! Studentlarni yuklab bo'lmadi.")
    }
  }, [isError])

  const createMutation = useCreateAdminStudent()
  const deleteMutation = useDeleteAdminStudent()

  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const updateMutation = useUpdateAdminStudent(selectedStudent?.id || 0)
  const [editDraft, setEditDraft] = useState<{
    email: string
    first_name: string
    last_name: string
    phone: string
    is_active: boolean
  }>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '+998',
    is_active: true,
  })

  const toNationalNine = (phone?: string): string | undefined => {
    if (!phone?.trim() || phone.trim() === '+998') return undefined
    let digits = phone.replace(/\D/g, '')
    if (digits.startsWith('998')) digits = digits.slice(3)
    if (digits.length < 9) return undefined
    return digits.slice(0, 9)
  }

  const handleInputChange = (
    field: keyof StudentFormData,
    value: string | boolean | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // +998 ni o'chirmaslik
    if (!value.startsWith('+998')) {
      value = '+998'
    }

    // Faqat raqamlarga ruxsat (+998 dan keyin)
    const digits = value.slice(4).replace(/\D/g, '')

    // Maksimal 15 ta raqam (ko'proq ruxsat berish uchun)
    const limitedDigits = digits.slice(0, 15)

    // Format: +998 XX XXX XX XX (9 raqam) + qo'shimcha raqamlar
    let formatted = '+998'
    if (limitedDigits.length > 0) formatted += ' ' + limitedDigits.slice(0, 2)
    if (limitedDigits.length > 2) formatted += ' ' + limitedDigits.slice(2, 5)
    if (limitedDigits.length > 5) formatted += ' ' + limitedDigits.slice(5, 7)
    if (limitedDigits.length > 7) formatted += ' ' + limitedDigits.slice(7, 9)
    if (limitedDigits.length > 9) formatted += ' ' + limitedDigits.slice(9, 12)
    if (limitedDigits.length > 12)
      formatted += ' ' + limitedDigits.slice(12, 15)

    handleInputChange('phone', formatted)
  }

  const resetForm = () => {
    setFormData(getInitialFormData())
    setAvatarPreview('')
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (student: User) => {
    setSelectedStudent(student)
    setEditDraft({
      email: student.email ?? '',
      first_name: student.first_name ?? '',
      last_name: student.last_name ?? '',
      phone: student.phone || '+998',
      is_active: Boolean(student.is_active),
    })
    setModalAction('edit')
    setModalOpen(true)
  }

  const handleAvatarPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setIsPreviewModalOpen(true)
  }

  const closePreviewModal = () => {
    setPreviewImage(null)
    setIsPreviewModalOpen(false)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedStudent(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Phone number validation - check if complete
    if (formData.phone && formData.phone !== '+998') {
      const digits = formData.phone.replace(/\D/g, '')
      if (digits.length < 9) {
        toast.error(
          "Telefon raqam to'liq kiritilmagan! Kamida 9 ta raqam kering."
        )
        return
      }
    }

    if (!formData.password || !String(formData.password).trim()) {
      toast.error('Password kiritilishi shart')
      return
    }

    const submitData = {
      ...formData,
      phone: formData.phone || undefined,
      password: formData.password || undefined,
    }

    // Create student (isModalOpen is for create modal)
    toast.promise(createMutation.mutateAsync(submitData), {
      loading: 'Yaratilmoqda...',
      success: () => {
        setIsModalOpen(false)
        resetForm()
        return 'Student yaratildi'
      },
      error: 'Xato yuz berdi',
    })
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

  const confirmDelete = () => {
    if (!selectedStudent) return
    toast.promise(deleteMutation.mutateAsync(selectedStudent.id), {
      loading: 'Ochirilmoqda...',
      success: 'Student ochirildi',
      error: 'Xato yuz berdi',
    })
    handleModalClose()
  }

  const confirmEdit = () => {
    if (!selectedStudent) return
    const payload = {
      email: editDraft.email.trim() || undefined,
      first_name: editDraft.first_name.trim() || undefined,
      last_name: editDraft.last_name.trim() || undefined,
      phone: toNationalNine(editDraft.phone),
      is_active: editDraft.is_active,
    }
    toast.promise(updateMutation.mutateAsync(payload), {
      loading: 'Yangilanilmoqda...',
      success: 'Student yangilandi',
      error: 'Xato yuz berdi',
    })
    handleModalClose()
  }

  const handleViewStudent = (student: User) => {
    setSelectedStudent(student)
    setModalAction('detail')
    setModalOpen(true)
  }

  return (
    <SearchProvider>
      <div className='min-h-screen bg-[#F8FAFC] dark:bg-[#020617]'>
        <Header>
          <Search className='me-auto' />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </Header>

        <Main>
          <div
            style={{
              fontSize: 11,
              color: '#94a3b8',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            <Link to='/admin-dashboard'>Dashboard</Link> /{' '}
            <span style={{ color: '#e11d48' }}>Students</span>
          </div>
          <div className='mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white'>
                  Students List
                </h1>
                <p className='mt-1 text-sm font-medium text-gray-600 dark:text-gray-400'>
                  All students information and payment status
                </p>
              </div>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <RoseButton
                    className='rounded-2xl dark:border dark:border-[#A01521] dark:bg-transparent dark:text-white dark:hover:border-[#A01521]'
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
                    <DialogTitle className='text-lg font-semibold text-slate-900'>
                      Add Student
                    </DialogTitle>
                    <button
                      type='button'
                      onClick={() => setIsModalOpen(false)}
                      className='grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                            className='h-16 w-16 rounded-full border-2 border-gray-300 object-cover'
                          />
                        ) : (
                          <div className='flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-100'>
                            <Plus className='h-6 w-6 text-gray-400' />
                          </div>
                        )}
                        <div className='absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#C00639]'>
                          <Plus className='h-2.5 w-2.5 text-white' />
                        </div>
                      </div>
                      <p className='text-sm text-gray-500'>Upload image</p>
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

          <div className='mb-4 md:hidden'>
            <div className='flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm'>
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
                <CardTitle className='text-sm font-medium text-gray-600'>
                  Yangi
                </CardTitle>
                <div className='h-8 w-8 rounded-full bg-blue-100 p-2'>
                  <Plus className='h-4 w-4 text-blue-600' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {students.length}
                </div>
                <p className='text-xs text-gray-500'>Jami studentlar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  Faol
                </CardTitle>
                <div className='h-8 w-8 rounded-full bg-green-100 p-2'>
                  <Plus className='h-4 w-4 text-green-600' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {students.filter((s) => s.is_active).length}
                </div>
                <p className='text-xs text-gray-500'>Faol studentlar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  Nofaol
                </CardTitle>
                <div className='h-8 w-8 rounded-full bg-red-100 p-2'>
                  <Plus className='h-4 w-4 text-red-600' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {students.filter((s) => !s.is_active).length}
                </div>
                <p className='text-xs text-gray-500'>Nofaol studentlar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  O'sish
                </CardTitle>
                <div className='h-8 w-8 rounded-full bg-purple-100 p-2'>
                  <Plus className='h-4 w-4 text-purple-600' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  +{students.length}%
                </div>
                <p className='text-xs text-gray-500'>O'sish darajasi</p>
              </CardContent>
            </Card>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div>
                  <CardTitle>Students Table</CardTitle>
                  <CardDescription>
                    Total {students.length} students
                  </CardDescription>
                </div>
                <div className='hidden w-[320px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex'>
                  <Search className='h-4 w-4 text-slate-400' />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder='Search students...'
                    className='h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0'
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='py-8 text-center'>
                  <div className='text-sm text-gray-500'>Yuklanmoqda...</div>
                </div>
              ) : isError ? (
                <div className='py-8 text-center'>
                  <div className='text-sm text-red-500'>Xatolik yuz berdi</div>
                </div>
              ) : students.length === 0 ? (
                <div className='py-8 text-center'>
                  <div className='text-sm text-gray-500'>
                    Studentlar mavjud emas
                  </div>
                </div>
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
                        <TableCell className='font-medium'>
                          <Avatar
                            className='h-8 w-8 cursor-pointer transition-opacity hover:opacity-80'
                            onClick={() =>
                              student.avatar &&
                              handleAvatarPreview(student.avatar)
                            }
                          >
                            <AvatarImage src={student.avatar || undefined} />
                            <AvatarFallback className='bg-gray-100 text-gray-600'>
                              <UserIcon className='h-4 w-4' />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className='font-medium'>
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>@{student.username}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              student.is_active
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {student.is_active ? 'Faol' : 'Nofaol'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end space-x-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleViewStudent(student)}
                              className='hover:bg-blue-50 hover:text-blue-600'
                              title='View'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => openEditModal(student)}
                              className='hover:bg-green-50 hover:text-green-600'
                              title='Edit'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteStudent(student)}
                              className='text-red-600 hover:bg-red-50 hover:text-red-700'
                              title='Delete'
                            >
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

          {/* Pagination */}
          <div className='mt-6 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              1-{students.length} dan {students.length} ta ko'rsatilmoqda
            </div>
            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm' disabled>
                Oldingi
              </Button>
              <Button variant='outline' size='sm'>
                1
              </Button>
              <Button variant='outline' size='sm' disabled>
                Keyingi
              </Button>
            </div>
          </div>
        </Main>

        {/* Image Preview Modal */}
        <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
          <DialogContent className='max-h-[90vh] max-w-4xl p-0'>
            <div className='relative'>
              <button
                onClick={closePreviewModal}
                className='absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70'
              >
                <X className='h-4 w-4' />
              </button>
              {previewImage && (
                <img
                  src={previewImage}
                  alt='Avatar preview'
                  className='h-full max-h-[85vh] w-full object-contain'
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Student Action Modal */}
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
                          {selectedStudent.first_name?.[0] || ''}
                          {selectedStudent.last_name?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='text-lg font-medium'>
                          {selectedStudent.first_name || ''}{' '}
                          {selectedStudent.last_name || ''}
                        </div>
                        <div className='text-sm text-gray-500'>
                          @{selectedStudent.username}
                        </div>
                      </div>
                    </div>
                    <div className='grid gap-2'>
                      <div>
                        <Label>Email</Label>
                        <div className='text-sm'>{selectedStudent.email}</div>
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <div className='text-sm'>
                          {selectedStudent.phone || 'Mavjud emas'}
                        </div>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className='text-sm'>
                          <Badge
                            variant={
                              selectedStudent.is_active
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {selectedStudent.is_active ? 'Faol' : 'Nofaol'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label>Role</Label>
                        <div className='text-sm'>{selectedStudent.role}</div>
                      </div>
                      <div>
                        <Label>Created</Label>
                        <div className='text-sm'>
                          {selectedStudent.created_at
                            ? new Date(
                                selectedStudent.created_at
                              ).toLocaleDateString('uz-UZ')
                            : 'Mavjud emas'}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {modalAction === 'delete' && (
                  <div>
                    <p className='text-sm text-gray-600'>
                      Are you sure you want to delete{' '}
                      {selectedStudent.first_name} {selectedStudent.last_name}?
                    </p>
                  </div>
                )}

                {modalAction === 'edit' && (
                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <Label htmlFor='edit-first-name'>First Name</Label>
                        <Input
                          id='edit-first-name'
                          value={editDraft.first_name}
                          onChange={(e) =>
                            setEditDraft((p) => ({
                              ...p,
                              first_name: e.target.value,
                            }))
                          }
                          className='mt-1'
                        />
                      </div>
                      <div>
                        <Label htmlFor='edit-last-name'>Last Name</Label>
                        <Input
                          id='edit-last-name'
                          value={editDraft.last_name}
                          onChange={(e) =>
                            setEditDraft((p) => ({
                              ...p,
                              last_name: e.target.value,
                            }))
                          }
                          className='mt-1'
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor='edit-email'>Email</Label>
                      <Input
                        id='edit-email'
                        type='email'
                        value={editDraft.email}
                        onChange={(e) =>
                          setEditDraft((p) => ({ ...p, email: e.target.value }))
                        }
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <Label htmlFor='edit-phone'>Phone</Label>
                      <Input
                        id='edit-phone'
                        value={editDraft.phone}
                        onChange={(e) =>
                          setEditDraft((p) => ({ ...p, phone: e.target.value }))
                        }
                        placeholder='+998 90 123 45 67'
                        className='mt-1'
                      />
                    </div>
                    <div className='flex items-center justify-between rounded-lg border p-3'>
                      <div>
                        <div className='text-sm font-semibold'>Status</div>
                        <div className='text-xs text-slate-500'>
                          {editDraft.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <Switch
                        checked={editDraft.is_active}
                        onCheckedChange={(checked) =>
                          setEditDraft((p) => ({ ...p, is_active: checked }))
                        }
                      />
                    </div>
                  </div>
                )}

                <div className='flex justify-end space-x-2'>
                  <Button variant='outline' onClick={handleModalClose}>
                    Cancel
                  </Button>
                  {modalAction === 'delete' && (
                    <Button variant='destructive' onClick={confirmDelete}>
                      Delete
                    </Button>
                  )}
                  {modalAction === 'edit' && (
                    <Button
                      onClick={confirmEdit}
                      disabled={updateMutation.isPending}
                    >
                      Save
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SearchProvider>
  )
}
