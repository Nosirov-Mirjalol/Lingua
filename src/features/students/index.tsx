import React, { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { studentsData } from '@/data/students-data'
import { Edit, Eye, Plus, Search, Trash2, User, X } from 'lucide-react'
import { SearchProvider } from '@/context/search-provider'
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
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoseButton } from '@/components/ui/rose-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { StudentModal } from './components/StudentModal'

export interface Student {
  id: number
  fullName: string
  phone: string
  group: string
  paymentStatus: 'paid' | 'pending' | 'overdue'
  status: 'active' | 'inactive'
  avatar: string | null
}

// --- Helper function to convert students data ---
const convertStudentsData = (students: typeof studentsData): Student[] => {
  return students.map((student) => ({
    id: student.id,
    fullName: student.name,
    phone: student.phone,
    group: student.groupName,
    paymentStatus: 'paid' as const, // Default payment status
    status: student.status === 'graduated' ? 'inactive' : student.status,
    avatar: student.avatar || null,
  }))
}

const getInitialStudentsData = (): Student[] => {
  if (typeof window !== 'undefined') {
    const savedData = localStorage.getItem('studentsData')
    if (savedData) {
      return JSON.parse(savedData)
    }
  }

  // Use converted data from separate file
  const defaultData = convertStudentsData(studentsData)

  if (typeof window !== 'undefined') {
    localStorage.setItem('studentsData', JSON.stringify(defaultData))
  }

  return defaultData
}

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
}

const statusColors = {
  active: 'bg-blue-100 text-blue-800',
  inactive: 'bg-gray-100 text-gray-800',
  overdue: 'bg-red-100 text-red-800',
}

export default function StudentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [studentsData, setStudentsData] = useState<Student[]>(() =>
    getInitialStudentsData()
  )
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    level: '',
    status: true,
    paymentStatus: '',
    avatar: null as File | null,
  })
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const { addToast, ToastContainer } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Image preview modal state
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  // Action modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [modalAction, setModalAction] = useState<'edit' | 'delete' | 'detail'>(
    'detail'
  )

  useEffect(() => {
    if (typeof window !== 'undefined' && studentsData.length > 0) {
      localStorage.setItem('studentsData', JSON.stringify(studentsData))
    }
  }, [studentsData])

  const handleInputChange = (
    field: string,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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

    // Format: +998 XX XXX XX XX
    let formatted = '+998'
    if (digits.length > 0) formatted += ' ' + digits.slice(0, 2)
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5)
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 7)
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9)

    setFormData((prev) => ({ ...prev, phone: formatted }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Add new student functionality only - edit is now handled by modal
    // Add new student
    const newStudent = {
      id: studentsData.length + 1,
      fullName: `${formData.name} ${formData.surname}`,
      phone: formData.phone,
      group: formData.level || 'Belgilanmagan',
      paymentStatus:
        (formData.paymentStatus as 'paid' | 'pending' | 'overdue') || 'pending',
      status: (formData.status ? 'active' : 'inactive') as
        | 'active'
        | 'inactive',
      avatar: avatarPreview || null,
    }

    setStudentsData((prev) => [newStudent, ...prev])

    // Show success toast
    addToast(
      `${formData.name} ${formData.surname} muvaffaqiyatli qo'shildi!`,
      'success'
    )

    // Reset form and close add modal
    setFormData({
      name: '',
      surname: '',
      phone: '',
      level: '',
      status: true,
      paymentStatus: '',
      avatar: null,
    })
    setAvatarPreview('')
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      surname: '',
      phone: '',
      level: '',
      status: true,
      paymentStatus: '',
      avatar: null,
    })
    setAvatarPreview('')
    setIsModalOpen(false)
  }

  const handleAvatarPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setIsPreviewModalOpen(true)
  }

  const closePreviewModal = () => {
    setPreviewImage(null)
    setIsPreviewModalOpen(false)
  }

  // Action handlers
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student)
    setModalAction('edit')
    setModalOpen(true)
  }

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student)
    setModalAction('delete')
    setModalOpen(true)
  }

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
    setModalAction('detail')
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedStudent(null)
  }

  const handleModalConfirm = (updatedStudent: Student) => {
    if (modalAction === 'delete') {
      // Delete functionality
      setStudentsData((prevStudents) =>
        prevStudents.filter((s) => s.id !== updatedStudent.id)
      )
      addToast(
        `${updatedStudent.fullName} student was successfully deleted`,
        'success'
      )
    } else if (modalAction === 'edit') {
      // Edit functionality
      setStudentsData((prevStudents) =>
        prevStudents.map((s) =>
          s.id === updatedStudent.id ? updatedStudent : s
        )
      )
      addToast(
        `${updatedStudent.fullName} student was successfully updated`,
        'success'
      )
    }
    handleModalClose()
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
            <Link to='/'>Dashboard</Link> /{' '}
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
                    onClick={() => {
                      setFormData({
                        name: '',
                        surname: '',
                        phone: '',
                        level: '',
                        status: true,
                        paymentStatus: '',
                        avatar: null,
                      })
                      setAvatarPreview('')
                    }}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Add Student
                  </RoseButton>
                </DialogTrigger>
                <DialogContent className='sm:max-w-125' showCloseButton={false}>
                  <div className='flex items-start justify-between px-6 pt-6'>
                    <DialogTitle className='text-xl font-semibold text-slate-900'>
                      Add Student
                    </DialogTitle>
                    <button
                      type='button'
                      onClick={() => setIsModalOpen(false)}
                      className='grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200'
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <form
                    onSubmit={handleSubmit}
                    className='flex flex-col items-center py-6'
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
                    <div className='mb-6 flex flex-col items-center'>
                      <div
                        className='relative mb-3 cursor-pointer'
                        onClick={handleAvatarClick}
                      >
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt='Avatar'
                            className='h-20 w-20 rounded-full border-2 border-gray-300 object-cover'
                          />
                        ) : (
                          <div className='flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-100'>
                            <Plus className='h-8 w-8 text-gray-400' />
                          </div>
                        )}
                        <div className='absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#C00639]'>
                          <Plus className='h-3 w-3 text-white' />
                        </div>
                      </div>
                      <p className='text-sm text-gray-500'>Upload image</p>
                    </div>

                    {/* Form Fields */}
                    <div className='mb-4 grid w-full grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='name' className='text-sm font-medium'>
                          First Name
                        </Label>
                        <Input
                          id='name'
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange('name', e.target.value)
                          }
                          placeholder='Enter first name'
                          className='h-10'
                          required
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='surname'
                          className='text-sm font-medium'
                        >
                          Last Name
                        </Label>
                        <Input
                          id='surname'
                          value={formData.surname}
                          onChange={(e) =>
                            handleInputChange('surname', e.target.value)
                          }
                          placeholder='Enter last name'
                          className='h-10'
                          required
                        />
                      </div>
                    </div>

                    <div className='mb-4 w-full space-y-2'>
                      <Label htmlFor='phone' className='text-sm font-medium'>
                        Phone Number
                      </Label>
                      <Input
                        id='phone'
                        value={formData.phone || '+998'}
                        onChange={handlePhoneChange}
                        placeholder='+998 XX XXX XX XX'
                        className='h-10'
                        required
                      />
                    </div>

                    <div className='mb-4 w-full space-y-2'>
                      <Label htmlFor='level' className='text-sm font-medium'>
                        Level
                      </Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value) =>
                          handleInputChange('level', value)
                        }
                      >
                        <SelectTrigger className='h-10'>
                          <SelectValue placeholder='Select level' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='beginner'>Beginner</SelectItem>
                          <SelectItem value='intermediate'>
                            Intermediate
                          </SelectItem>
                          <SelectItem value='advanced'>Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='mb-6 grid w-full grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='status' className='text-sm font-medium'>
                          Status
                        </Label>
                        <div className='flex h-10 items-center space-x-2'>
                          <Switch
                            id='status'
                            checked={formData.status}
                            onCheckedChange={(checked) =>
                              handleInputChange('status', checked)
                            }
                          />
                          <Label
                            htmlFor='status'
                            className='text-sm text-gray-600'
                          >
                            Active
                          </Label>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='payment-status'
                          className='text-sm font-medium'
                        >
                          Payment Status
                        </Label>
                        <Select
                          value={formData.paymentStatus}
                          onValueChange={(value) =>
                            handleInputChange('paymentStatus', value)
                          }
                        >
                          <SelectTrigger className='h-10'>
                            <SelectValue placeholder='Select payment status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='paid'>Paid</SelectItem>
                            <SelectItem value='pending'>Pending</SelectItem>
                            <SelectItem value='overdue'>Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex w-full justify-end space-x-3 border-t pt-4'>
                      <Button
                        type='button'
                        variant='outline'
                        className='px-6 py-2'
                        onClick={handleCancel}
                      >
                        Bekor qilish
                      </Button>
                      <RoseButton type='submit' className='px-6 py-2'>
                        Saqlash
                      </RoseButton>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
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
                  12
                </div>
                <p className='text-xs text-gray-500'>Bu oy qo'shilgan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  To'lagan
                </CardTitle>
                <div className='h-8 w-8 rounded-full bg-green-100 p-2'>
                  <Plus className='h-4 w-4 text-green-600' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  234
                </div>
                <p className='text-xs text-gray-500'>To'lov qilgan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  Qarzdorlar
                </CardTitle>
                <div className='h-8 w-8 rounded-full bg-red-100 p-2'>
                  <Plus className='h-4 w-4 text-red-600' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  8
                </div>
                <p className='text-xs text-gray-500'>Debtors</p>
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
                  +15%
                </div>
                <p className='text-xs text-gray-500'>O'tgan oyga nisbatan</p>
              </CardContent>
            </Card>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Students Table</CardTitle>
              <CardDescription>
                Total {studentsData.length} students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-12'></TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsData.map((student) => (
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
                            <User className='h-4 w-4' />
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className='font-medium'>
                        {student.fullName}
                      </TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{student.group}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            paymentStatusColors[
                              student.paymentStatus as keyof typeof paymentStatusColors
                            ]
                          }
                        >
                          {student.paymentStatus === 'paid' && "To'langan"}
                          {student.paymentStatus === 'pending' && 'Kutilmoqda'}
                          {student.paymentStatus === 'overdue' && 'Qarzdor'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusColors[
                              student.status as keyof typeof statusColors
                            ]
                          }
                        >
                          {student.status === 'active' ? 'Faol' : 'Inactive'}
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
                            onClick={() => handleEditStudent(student)}
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
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className='mt-6 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              1-{studentsData.length} dan {studentsData.length} ta
              ko'rsatilmoqda
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
        <ToastContainer />

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

        {/* Student Modal */}
        <StudentModal
          student={selectedStudent}
          isOpen={modalOpen}
          onClose={handleModalClose}
          action={modalAction}
          onConfirm={handleModalConfirm}
        />
      </div>
    </SearchProvider>
  )
}
