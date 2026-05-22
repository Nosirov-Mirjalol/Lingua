import React, { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Calendar,
  Edit,
  Eye,
  Mail,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { getStudentApiErrorMessage } from '@/api/service/admin/student.service'
import type { User } from '@/api/service/teacher/user.type'
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
import { ListPagination } from '@/components/list-pagination'
import { ThemeSwitch } from '@/components/theme-switch'

interface StudentFormData {
  username: string

  email: string

  full_name: string

  phone: string

  password: string

  is_active: boolean
}

const getInitialFormData = (): StudentFormData => ({
  username: '',

  email: '',

  full_name: '',

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

  const {
    data: students = [],

    isLoading,

    isError,
  } = useAdminStudents(search, page, pageSize)

  useEffect(() => {
    if (isError)
      toast.error("API ulanishda xatolik! Studentlarni yuklab bo'lmadi.")
  }, [isError])

  const createMutation = useCreateAdminStudent()

  const deleteMutation = useDeleteAdminStudent()

  const updateMutation = useUpdateAdminStudent()

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [formData, setFormData] = useState<StudentFormData>(getInitialFormData)

  const [modalOpen, setModalOpen] = useState(false)

  const [modalAction, setModalAction] = useState<'edit' | 'delete' | 'detail'>(
    'detail'
  )

  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)

  const [editDraft, setEditDraft] = useState({
    username: '',

    full_name: '',

    phone: '+998',

    is_active: true,

    email: '',
  })

  const handleInputChange = (
    field: keyof StudentFormData,

    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => setFormData(getInitialFormData())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username.trim())
      return toast.error('Username kiritilishi shart')

    if (!formData.email.trim()) return toast.error('Email kiritilishi shart')

    if (!formData.full_name.trim())
      return toast.error("To'liq ism to'ldirilishi shart")

    if (!formData.password.trim()) return toast.error('Parol kiritilishi shart')

    if (formData.password.trim().length < 8)
      return toast.error("Parol kamida 8 belgi bo'lishi kerak")

    toast.promise(
      createMutation.mutateAsync({
        username: formData.username.trim(),

        email: formData.email.trim(),

        full_name: formData.full_name.trim(),

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

        error: (err) => getStudentApiErrorMessage(err, 'Yaratishda xatolik'),
      }
    )
  }

  const openEditModal = (student: User) => {
    setSelectedStudent(student)

    setEditDraft({
      username: student.username ?? '',

      email: student.email ?? '',

      full_name:
        `${student.first_name || ''} ${student.last_name || ''}`.trim(),

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

  const confirmDelete = () => {
    if (!selectedStudent) return

    const studentId =
      typeof selectedStudent.id === 'string'
        ? parseInt(selectedStudent.id, 10)
        : selectedStudent.id

    deleteMutation.mutateAsync(studentId).then(() => {
      handleModalClose()

      toast.success("Student o'chirildi")
    })
  }

  const confirmEdit = () => {
    if (!selectedStudent) return

    if (!editDraft.full_name.trim())
      return toast.error("To'liq ism to'ldirilishi shart")

    if (!editDraft.username.trim())
      return toast.error('Username kiritilishi shart')

    const studentId =
      typeof selectedStudent.id === 'string'
        ? parseInt(selectedStudent.id, 10)
        : selectedStudent.id

    updateMutation

      .mutateAsync({
        studentId,

        data: {
          username: editDraft.username.trim(),

          full_name: editDraft.full_name.trim(),

          phone: editDraft.phone,
        },
      })

      .then(() => {
        handleModalClose()

        toast.success('Student yangilandi')
      })
  }

  const activeCount = students.filter((s) => s.is_active).length

  const inactiveCount = students.filter((s) => !s.is_active).length

  return (
    <div className='min-h-screen bg-background'>
      <Header>
        <div className='me-auto w-full sm:w-auto'>
          <div className='flex items-center gap-2 rounded-2xl border bg-background px-3 py-2 shadow-sm md:w-80'>
            <Search className='h-4 w-4 text-muted-foreground' />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search students...'
              className='h-8 w-full border-0 bg-transparent px-0 text-sm focus-visible:ring-0'
            />
          </div>
        </div>

        <ThemeSwitch />

        <ConfigDrawer />
      </Header>

      <Main>
        <p className='mb-4 text-xs font-semibold tracking-wide text-muted-foreground'>
          <Link to='/admin-dashboard'>Dashboard</Link> /{' '}
          <span className='text-primary'>Students</span>
        </p>

        <div className='mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl'>
              Students List
            </h1>

            <p className='mt-1 text-xs font-medium text-muted-foreground sm:text-sm'>
              All students information and payment status
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <RoseButton
                className='w-full rounded-2xl sm:w-auto'
                onClick={() => {
                  resetForm()

                  setIsCreateOpen(true)
                }}
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Student
              </RoseButton>
            </DialogTrigger>

            <DialogContent
              className='max-h-[90vh] overflow-y-auto p-4 sm:max-w-lg sm:p-6'
              showCloseButton={false}
            >
              <div className='flex items-start justify-between px-0 pt-4 sm:px-4'>
                <DialogTitle className='text-base font-semibold sm:text-lg'>
                  Add Student
                </DialogTitle>

                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => setIsCreateOpen(false)}
                  className='h-8 w-8 rounded-full'
                >
                  <X size={16} />
                </Button>
              </div>

              <form
                onSubmit={handleSubmit}
                className='flex flex-col items-center py-4'
              >
                <div className='mb-3 grid w-full grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='full_name' className='text-xs font-medium'>
                      To'liq ism
                    </Label>

                    <Input
                      id='full_name'
                      value={formData.full_name}
                      onChange={(e) =>
                        handleInputChange('full_name', e.target.value)
                      }
                      placeholder='Enter full name'
                      className='h-9'
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
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange('phone', formatPhone(e.target.value))
                    }
                    placeholder='+998 XX XXX XX XX'
                    className='h-9'
                    maxLength={18}
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

                <div className='mb-4 w-full space-y-1'>
                  <Label htmlFor='is_active' className='text-xs font-medium'>
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
                      className='text-xs text-muted-foreground'
                    >
                      Active
                    </Label>
                  </div>
                </div>

                <div className='flex w-full justify-end space-x-2 border-t pt-3'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      resetForm()

                      setIsCreateOpen(false)
                    }}
                  >
                    Bekor qilish
                  </Button>

                  <RoseButton type='submit'>Saqlash</RoseButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}

        <div className='mb-6 grid gap-4 sm:mb-8 sm:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium text-muted-foreground sm:text-sm'>
                Jami
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className='text-xl font-bold sm:text-2xl'>
                {students.length}
              </div>

              <p className='text-[10px] text-muted-foreground sm:text-xs'>
                Jami studentlar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium text-muted-foreground sm:text-sm'>
                Faol
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className='text-xl font-bold sm:text-2xl'>{activeCount}</div>

              <p className='text-[10px] text-muted-foreground sm:text-xs'>
                Faol studentlar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium text-muted-foreground sm:text-sm'>
                Nofaol
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className='text-xl font-bold sm:text-2xl'>
                {inactiveCount}
              </div>

              <p className='text-[10px] text-muted-foreground sm:text-xs'>
                Nofaol studentlar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}

        <Card>
          <CardHeader>
            <CardTitle className='text-base sm:text-lg'>
              Students Table
            </CardTitle>

            <CardDescription className='text-xs sm:text-sm'>
              Total {students.length} students
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className='py-8 text-center text-xs text-muted-foreground sm:text-sm'>
                Yuklanmoqda...
              </div>
            ) : isError ? (
              <div className='py-8 text-center text-xs text-destructive sm:text-sm'>
                Xatolik yuz berdi
              </div>
            ) : students.length === 0 ? (
              <div className='py-8 text-center text-xs text-muted-foreground sm:text-sm'>
                Studentlar mavjud emas
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table className='min-w-[600px]'>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12 px-3 py-2 text-[10px] sm:px-4 sm:py-3 sm:text-xs'></TableHead>

                      <TableHead className='px-3 py-2 text-[10px] sm:px-4 sm:py-3 sm:text-xs'>
                        Full Name
                      </TableHead>

                      <TableHead className='px-3 py-2 text-[10px] sm:px-4 sm:py-3 sm:text-xs'>
                        Username
                      </TableHead>

                      <TableHead className='px-3 py-2 text-[10px] sm:px-4 sm:py-3 sm:text-xs'>
                        Phone
                      </TableHead>

                      <TableHead className='px-3 py-2 text-[10px] sm:px-4 sm:py-3 sm:text-xs'>
                        Status
                      </TableHead>

                      <TableHead className='px-3 py-2 text-right text-[10px] sm:px-4 sm:py-3 sm:text-xs'>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className='px-3 py-2 sm:px-4 sm:py-3'>
                          <Avatar className='h-7 w-7 sm:h-8 sm:w-8'>
                            <AvatarImage src={student.avatar || undefined} />

                            <AvatarFallback className='bg-muted text-foreground'>
                              <UserIcon className='h-3 w-3 sm:h-4 sm:w-4' />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>

                        <TableCell className='px-3 py-2 text-xs font-medium sm:px-4 sm:py-3 sm:text-sm'>
                          {student.first_name} {student.last_name}
                        </TableCell>

                        <TableCell className='px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm'>
                          @{student.username}
                        </TableCell>

                        <TableCell className='px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm'>
                          {student.phone || '-'}
                        </TableCell>

                        <TableCell className='px-3 py-2 sm:px-4 sm:py-3'>
                          <Badge
                            className={
                              student.is_active
                                ? 'bg-primary/10 text-[10px] text-primary sm:text-xs'
                                : 'bg-muted text-[10px] text-muted-foreground sm:text-xs'
                            }
                          >
                            {student.is_active ? 'Faol' : 'Nofaol'}
                          </Badge>
                        </TableCell>

                        <TableCell className='px-3 py-2 text-right sm:px-4 sm:py-3'>
                          <div className='flex items-center justify-end space-x-1'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              className='h-7 w-7 p-0 sm:h-8 sm:w-8 sm:p-2'
                              onClick={() => {
                                setSelectedStudent(student)

                                setModalAction('detail')

                                setModalOpen(true)
                              }}
                              aria-label='View'
                            >
                              <Eye className='h-3 w-3 sm:h-4 sm:w-4' />
                            </Button>

                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              className='h-7 w-7 p-0 sm:h-8 sm:w-8 sm:p-2'
                              onClick={() => openEditModal(student)}
                              aria-label='Edit'
                            >
                              <Edit className='h-3 w-3 sm:h-4 sm:w-4' />
                            </Button>

                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              className='h-7 w-7 p-0 text-destructive hover:bg-destructive/10 sm:h-8 sm:w-8 sm:p-2'
                              onClick={() => {
                                setSelectedStudent(student)

                                setModalAction('delete')

                                setModalOpen(true)
                              }}
                              aria-label='Delete'
                            >
                              <Trash2 className='h-3 w-3 sm:h-4 sm:w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className='mt-4 flex flex-col items-center gap-4 sm:mt-6 sm:flex-row sm:justify-between'>
          <p className='text-sm text-muted-foreground'>
            {students.length} ta ko'rsatilmoqda
          </p>

          <ListPagination
            page={page}
            pageSize={pageSize}
            totalCount={students.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)

              setPage(1)
            }}
          />
        </div>
      </Main>

      {/* Action Modal */}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className='rounded-2xl border-none bg-card p-6 shadow-xl sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold'>
              {modalAction === 'detail' && 'Student Tafsilotlari'}

              {modalAction === 'edit' && 'Studentni Tahrirlash'}

              {modalAction === 'delete' && "Studentni O'chirish"}
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className='space-y-4'>
              {modalAction === 'detail' && (
                <div className='space-y-6'>
                  <div className='flex items-center gap-4 rounded-2xl bg-muted/50 p-6'>
                    <Avatar className='h-20 w-20 border-2 border-background shadow-sm'>
                      <AvatarImage src={selectedStudent.avatar} />

                      <AvatarFallback className='bg-primary text-2xl font-bold text-primary-foreground'>
                        {selectedStudent.first_name?.[0]}

                        {selectedStudent.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className='flex-1'>
                      <h3 className='text-xl font-bold text-foreground'>
                        {selectedStudent.first_name} {selectedStudent.last_name}
                      </h3>

                      <p className='text-sm text-muted-foreground'>
                        @{selectedStudent.username}
                      </p>

                      <Badge
                        className={
                          selectedStudent.is_active
                            ? 'mt-2 bg-primary/10 text-primary'
                            : 'mt-2 bg-muted text-muted-foreground'
                        }
                      >
                        {selectedStudent.is_active ? 'Faol' : 'Nofaol'}
                      </Badge>
                    </div>
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='rounded-xl border bg-card p-4'>
                      <div className='flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                        <Mail className='h-4 w-4' />
                        Email
                      </div>

                      <p className='mt-2 text-sm font-medium text-foreground'>
                        {selectedStudent.email}
                      </p>
                    </div>

                    <div className='rounded-xl border bg-card p-4'>
                      <div className='flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                        <Phone className='h-4 w-4' />
                        Telefon
                      </div>

                      <p className='mt-2 text-sm font-medium text-foreground'>
                        {selectedStudent.phone || 'Mavjud emas'}
                      </p>
                    </div>

                    <div className='rounded-xl border bg-card p-4'>
                      <div className='flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                        <Shield className='h-4 w-4' />
                        Role
                      </div>

                      <p className='mt-2 text-sm font-medium text-foreground capitalize'>
                        {selectedStudent.role}
                      </p>
                    </div>

                    <div className='rounded-xl border bg-card p-4'>
                      <div className='flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                        <Calendar className='h-4 w-4' />
                        Yaratilgan
                      </div>

                      <p className='mt-2 text-sm font-medium text-foreground'>
                        {selectedStudent.created_at
                          ? new Date(
                              selectedStudent.created_at
                            ).toLocaleDateString('uz-UZ')
                          : 'Mavjud emas'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {modalAction === 'delete' && (
                <p className='text-sm text-muted-foreground'>
                  {selectedStudent.first_name} {selectedStudent.last_name} ni
                  o'chirmoqchimisiz?
                </p>
              )}

              {modalAction === 'edit' && (
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='edit-username'>Username</Label>

                    <Input
                      id='edit-username'
                      value={editDraft.username}
                      onChange={(e) =>
                        setEditDraft((p) => ({
                          ...p,

                          username: e.target.value,
                        }))
                      }
                      className='mt-1'
                    />
                  </div>

                  <div>
                    <Label htmlFor='edit-full-name'>To'liq ism</Label>

                    <Input
                      id='edit-full-name'
                      value={editDraft.full_name}
                      onChange={(e) =>
                        setEditDraft((p) => ({
                          ...p,

                          full_name: e.target.value,
                        }))
                      }
                      className='mt-1'
                    />
                  </div>

                  <div>
                    <Label htmlFor='edit-phone'>Telefon</Label>

                    <Input
                      id='edit-phone'
                      value={editDraft.phone}
                      onChange={(e) =>
                        setEditDraft((p) => ({
                          ...p,

                          phone: formatPhone(e.target.value),
                        }))
                      }
                      placeholder='+998 90 123 45 67'
                      className='mt-1'
                    />
                  </div>

                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div>
                      <div className='text-sm font-semibold'>Status</div>

                      <div className='text-xs text-muted-foreground'>
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

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={handleModalClose}
                  className='h-10 rounded-xl'
                >
                  Bekor qilish
                </Button>

                {modalAction === 'delete' && (
                  <Button
                    variant='destructive'
                    onClick={confirmDelete}
                    className='h-10 rounded-xl'
                  >
                    O'chirish
                  </Button>
                )}

                {modalAction === 'edit' && (
                  <RoseButton
                    onClick={confirmEdit}
                    disabled={updateMutation.isPending}
                    className='h-10 rounded-xl'
                  >
                    Saqlash
                  </RoseButton>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
