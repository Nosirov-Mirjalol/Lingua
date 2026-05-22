import React, { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Calendar, Eye, Phone, Plus, Search, Shield, Trash2, User as UserIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import { getStudentApiErrorMessage } from '@/api/service/admin/student.service'
import type { User } from '@/api/service/teacher/user.type'
import { useAdminStudents } from '@/hooks/admin/students/useAdminStudents'
import { useCreateAdminStudent } from '@/hooks/admin/students/useCreateAdminStudent'
import { useDeleteAdminStudent } from '@/hooks/admin/students/useDeleteAdminStudent'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoseButton } from '@/components/ui/rose-button'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ListPagination } from '@/components/list-pagination'
import { ThemeSwitch } from '@/components/theme-switch'

interface StudentFormData {
  username: string
  full_name: string
  phone: string
  password: string
  is_active: boolean
}

const INITIAL_FORM: StudentFormData = {
  username: '',
  full_name: '',
  phone: '+998',
  password: '',
  is_active: true,
}

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
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState<StudentFormData>(INITIAL_FORM)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<'delete' | 'detail'>('detail')
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)

  const { data: students = [], isLoading, isError } = useAdminStudents(search, page, pageSize)
  const createMutation = useCreateAdminStudent()
  const deleteMutation = useDeleteAdminStudent()

  useEffect(() => {
    if (isError) toast.error("API ulanishda xatolik! Studentlarni yuklab bo'lmadi.")
  }, [isError])

  const handleInputChange = (field: keyof StudentFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => setFormData(INITIAL_FORM)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username.trim()) return toast.error('Username kiritilishi shart')
    if (!formData.full_name.trim()) return toast.error("To'liq ism to'ldirilishi shart")
    if (!formData.password.trim()) return toast.error('Parol kiritilishi shart')
    if (formData.password.trim().length < 8) return toast.error("Parol kamida 8 belgi bo'lishi kerak")

    toast.promise(
      createMutation.mutateAsync({
        username: formData.username.trim(),
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

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedStudent(null)
  }

  const confirmDelete = async () => {
    if (!selectedStudent) return
    const id = typeof selectedStudent.id === 'string' ? parseInt(selectedStudent.id, 10) : selectedStudent.id
    await deleteMutation.mutateAsync(id)
    handleModalClose()
    toast.success("Student o'chirildi")
  }

  const activeCount = students.filter((s) => s.is_active).length

  return (
    <div className='min-h-screen bg-background'>
      <Header>
        <div className='me-auto'>
          <div className='flex items-center gap-2 rounded-2xl border bg-background px-3 py-2 shadow-sm md:w-80'>
            <Search className='h-4 w-4 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search students...'
              className='h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0'
            />
          </div>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main>
        <p className='mb-4 text-xs font-semibold tracking-wide text-muted-foreground'>
          <Link to='/admin-dashboard'>Dashboard</Link> / <span className='text-primary'>Students</span>
        </p>

        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>Students List</h1>
            <p className='mt-1 text-sm font-medium text-muted-foreground'>All students information and payment status</p>
          </div>
          <RoseButton
            className='rounded-2xl'
            onClick={() => {
              resetForm()
              setIsCreateOpen(true)
            }}
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Student
          </RoseButton>
        </div>

        {/* Stats */}
        <div className='mb-8 grid gap-4 sm:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>Jami</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{students.length}</div>
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
              <div className='text-2xl font-bold'>{students.length - activeCount}</div>
              <p className='text-xs text-muted-foreground'>Nofaol studentlar</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Students Table</CardTitle>
            <CardDescription>Total {students.length} students</CardDescription>
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
                      <TableCell className='font-medium'>{student.full_name}</TableCell>
                      <TableCell>@{student.username}</TableCell>
                      <TableCell>{student.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge className={student.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}>
                          {student.is_active ? 'Faol' : 'Nofaol'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end space-x-1'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            aria-label='View'
                            onClick={() => { setSelectedStudent(student); setModalAction('detail'); setModalOpen(true) }}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            aria-label='Delete'
                            className='text-destructive hover:bg-destructive/10'
                            onClick={() => { setSelectedStudent(student); setModalAction('delete'); setModalOpen(true) }}
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

        <div className='mt-6 flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>{students.length} ta ko'rsatilmoqda</p>
          <ListPagination
            page={page}
            pageSize={pageSize}
            totalCount={students.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          />
        </div>
      </Main>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg' showCloseButton={false}>
          <div className='flex items-start justify-between px-4 pt-4'>
            <DialogTitle className='text-lg font-semibold'>Add Student</DialogTitle>
            <Button type='button' variant='ghost' size='icon' onClick={() => setIsCreateOpen(false)} className='h-8 w-8 rounded-full'>
              <X size={16} />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className='flex flex-col items-center py-4'>
            <div className='mb-3 grid w-full grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <Label htmlFor='full_name' className='text-xs font-medium'>To'liq ism</Label>
                <Input id='full_name' value={formData.full_name} onChange={(e) => handleInputChange('full_name', e.target.value)} placeholder='Enter full name' className='h-9' />
              </div>
            </div>
            <div className='mb-3 w-full space-y-1'>
              <Label htmlFor='username' className='text-xs font-medium'>Username</Label>
              <Input id='username' value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} placeholder='Enter username' className='h-9' required />
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

      {/* Action Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className='rounded-2xl border-none bg-card p-6 shadow-xl sm:max-w-lg'>
          <DialogTitle className='text-xl font-bold'>
            {modalAction === 'detail' ? 'Student Tafsilotlari' : "Studentni O'chirish"}
          </DialogTitle>
          {selectedStudent && (
            <div className='space-y-4'>
              {modalAction === 'detail' && (
                <div className='space-y-6'>
                  <div className='flex items-center gap-4 rounded-2xl bg-muted/50 p-6'>
                    <Avatar className='h-20 w-20 border-2 border-background shadow-sm'>
                      <AvatarImage src={selectedStudent.avatar} />
                      <AvatarFallback className='bg-primary text-2xl font-bold text-primary-foreground'>
                        {selectedStudent.full_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <h3 className='text-xl font-bold text-foreground'>{selectedStudent.full_name}</h3>
                      <p className='text-sm text-muted-foreground'>@{selectedStudent.username}</p>
                      <Badge className={selectedStudent.is_active ? 'mt-2 bg-primary/10 text-primary' : 'mt-2 bg-muted text-muted-foreground'}>
                        {selectedStudent.is_active ? 'Faol' : 'Nofaol'}
                      </Badge>
                    </div>
                  </div>
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='rounded-xl border bg-card p-4'>
                      <div className='flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                        <Phone className='h-4 w-4' /> Telefon
                      </div>
                      <p className='mt-2 text-sm font-medium text-foreground'>{selectedStudent.phone || 'Mavjud emas'}</p>
                    </div>
                    <div className='rounded-xl border bg-card p-4'>
                      <div className='flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                        <Shield className='h-4 w-4' /> Role
                      </div>
                      <p className='mt-2 text-sm font-medium text-foreground capitalize'>{selectedStudent.role}</p>
                    </div>
                    <div className='rounded-xl border bg-card p-4'>
                      <div className='flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                        <Calendar className='h-4 w-4' /> Yaratilgan
                      </div>
                      <p className='mt-2 text-sm font-medium text-foreground'>
                        {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString('uz-UZ') : 'Mavjud emas'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {modalAction === 'delete' && (
                <p className='text-sm text-muted-foreground'>
                  {selectedStudent.full_name} ni o'chirmoqchimisiz?
                </p>
              )}
              <div className='flex justify-end gap-2 pt-4'>
                <Button variant='outline' onClick={handleModalClose} className='h-10 rounded-xl'>Bekor qilish</Button>
                {modalAction === 'delete' && (
                  <Button variant='destructive' onClick={confirmDelete} className='h-10 rounded-xl'>O'chirish</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}