import { Link, useParams } from '@tanstack/react-router'
import { teachersData } from '@/data/teachers-data'
import { Calendar, ChevronLeft, MapPin, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

// Mock groups data with detailed info
const detailedGroupsData = [
  {
    id: 1,
    name: 'Web Development Group 1',
    teacher: 'John Doe',
    schedule: 'Dushanba-Chorshanba 09:00-11:00',
    students: 12,
    room: '201',
  },
  {
    id: 4,
    name: 'UI/UX Design Group',
    teacher: 'Sarah Wilson',
    schedule: 'Seshanba-Payshanba 14:00-16:00',
    students: 8,
    room: '205',
  },
  {
    id: 2,
    name: 'Mobile Development Group',
    teacher: 'Jane Smith',
    schedule: 'Dushanba-Juma 10:00-12:00',
    students: 15,
    room: '102',
  },
  {
    id: 3,
    name: 'Data Science Group',
    teacher: 'Mike Johnson',
    schedule: 'Seshanba-Juma 16:00-18:00',
    students: 10,
    room: '103',
  },
  {
    id: 5,
    name: 'DevOps Group',
    teacher: 'David Brown',
    schedule: 'Chorshanba-Juma 16:00-18:00',
    students: 6,
    room: '301',
  },
  {
    id: 6,
    name: 'Backend Development Group',
    teacher: 'Emily Davis',
    schedule: 'Shanba-Yakshanba 10:00-13:00',
    students: 9,
    room: '302',
  },
  // Additional groups for teachers who had multiple groups
  {
    id: 7,
    name: 'Web Development Group 2',
    teacher: 'John Doe',
    schedule: 'Chorshanba-Juma 14:00-16:00',
    students: 8,
    room: '202',
  },
  {
    id: 8,
    name: 'Advanced UI/UX Design',
    teacher: 'Sarah Wilson',
    schedule: 'Dushanba-Chorshanba 16:00-18:00',
    students: 10,
    room: '206',
  },
  {
    id: 9,
    name: 'Machine Learning Group',
    teacher: 'Mike Johnson',
    schedule: 'Shanba-Yakshanba 09:00-12:00',
    students: 7,
    room: '104',
  },
  {
    id: 10,
    name: 'Cloud Architecture Group',
    teacher: 'David Brown',
    schedule: 'Seshanba-Chorshanba 10:00-12:00',
    students: 5,
    room: '302',
  },
]

export default function TeacherGroupsPage() {
  const { teacherId } = useParams({
    from: '/_authenticated/teachers/$teacherId/groups/',
  })
  const teacherIdNum = parseInt(teacherId)

  // Check both localStorage and imported teachersData
  const localStorageTeachers = JSON.parse(
    localStorage.getItem('teachers') || '[]'
  )
  const allTeachers = [...teachersData, ...localStorageTeachers]
  const selectedTeacher = allTeachers.find((t) => t.id === teacherIdNum)

  const getTeacherGroupsTable = (teacherName: string) => {
    return detailedGroupsData.filter((group) => group.teacher === teacherName)
  }

  if (!selectedTeacher) {
    return (
      <>
        <Header>
          <div className='ms-auto flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div
            style={{
              padding: '24px 32px 0',
              fontSize: 11,
              color: '#94a3b8',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            <Link to='/teachers'>Teachers</Link> /{' '}
            <span style={{ color: '#e11d48' }}>USTOZ TOPILMADI</span>
          </div>
          <div className='container mx-auto p-6'>
            <div className='text-center'>
              <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100'>
                <Users className='h-12 w-12 text-red-600' />
              </div>
              <h1 className='mb-4 text-2xl font-bold text-gray-900'>
                Ustoz topilmadi
              </h1>
              <p className='mb-6 text-gray-600'>
                ID: {teacherId} bo\'yicha ustoz ma\'lumotlari topilmadi
              </p>
              <div className='mx-auto mb-6 max-w-md text-left'>
                <p className='mb-2 text-sm text-gray-500'>
                  Mumkin bo\'lgan sabablar:
                </p>
                <ul className='list-inside list-disc text-sm text-gray-600'>
                  <li>Ustoz o\'chirilgan bo\'lishi mumkin</li>
                  <li>
                    Ustoz ma\'lumotlari noto\'g\'ri saqlangan bo\'lishi mumkin
                  </li>
                  <li>URL manzili xato bo\'lishi mumkin</li>
                </ul>
              </div>
              <Link to='/teachers'>
                <Button>Ortga qaytish</Button>
              </Link>
            </div>
          </div>
        </Main>
      </>
    )
  }

  const teacherGroups = getTeacherGroupsTable(selectedTeacher.name)

  const handleDeleteGroup = (groupId: number) => {
    if (window.confirm("Ushbu guruhni o'chirishni xohlaysizmi?")) {
      // Remove from localStorage
      const existingGroups = JSON.parse(
        localStorage.getItem('teacherGroups') || '[]'
      )
      const updatedGroups = existingGroups.filter(
        (group: any) => group.id !== groupId
      )
      localStorage.setItem('teacherGroups', JSON.stringify(updatedGroups))

      // Remove from detailedGroupsData (mock data)
      const index = detailedGroupsData.findIndex(
        (group) => group.id === groupId
      )
      if (index > -1) {
        detailedGroupsData.splice(index, 1)
      }

      // Show success message
      alert("Guruh muvaffaqiyatli o'chirildi")

      // Force re-render
      window.location.reload()
    }
  }

  // Check if teacher has no groups
  if (teacherGroups.length === 0) {
    return (
      <>
        <Header>
          <div className='ms-auto flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div
            style={{
              padding: '24px 32px 0',
              fontSize: 11,
              color: '#94a3b8',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            <Link to='/teachers'>Teachers</Link> /{' '}
            <span style={{ color: '#e11d48' }}>
              {selectedTeacher.name} - GURUHLAR
            </span>
          </div>
          <div className='container mx-auto p-6'>
            <div className='text-center'>
              <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100'>
                <Users className='h-12 w-12 text-gray-400' />
              </div>
              <h1 className='mb-4 text-2xl font-bold text-gray-900'>
                {selectedTeacher.name} - Guruhlari yo'q
              </h1>
              <p className='mb-6 text-gray-600'>
                Ushbu ustoz hali hech qanday guruhga biriktirilmagan
              </p>
              <div className='mb-6'>
                <p className='mb-2 text-sm text-gray-500'>
                  Ustoz ma'lumotlari:
                </p>
                <div className='inline-block rounded-lg bg-gray-50 p-4 text-left'>
                  <p className='font-semibold'>{selectedTeacher.name}</p>
                  <p className='text-sm text-gray-600'>
                    {selectedTeacher.subject}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {selectedTeacher.phone}
                  </p>
                </div>
              </div>
              <div className='flex justify-center gap-3'>
                <Link to='/teachers'>
                  <Button variant='outline'>Ortga qaytish</Button>
                </Link>
                <Button
                  onClick={() => {
                    alert('Ustozga guruh biriktirish funksiyasi')
                  }}
                  style={{
                    background: '#e11d48',
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  Guruh biriktirish
                </Button>
              </div>
            </div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div
          style={{
            padding: '24px 32px 0',
            fontSize: 11,
            color: '#94a3b8',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          <Link to='/teachers'>Teachers</Link> /{' '}
          <span style={{ color: '#e11d48' }}>
            {selectedTeacher.name} - GURUHLAR
          </span>
        </div>

        <div className='container mx-auto space-y-6 p-6'>
          {/* Teacher Info Header */}
          <div className='mb-6'>
            <div className='mb-2 flex items-center gap-4'>
              <Link to='/teachers'>
                <Button variant='outline'>
                  <ChevronLeft className='mr-2 h-4 w-4' />
                  Ortga
                </Button>
              </Link>
              <h1 className='text-3xl font-bold'>
                {selectedTeacher.name} - Guruhlari
              </h1>
            </div>
            <p className='text-muted-foreground'>
              Ushbu ustozning barcha guruhlari va ularning jadvali
            </p>
          </div>

          {/* Teacher Summary Card */}
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
                    <Users className='h-8 w-8 text-blue-600' />
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold'>
                      {selectedTeacher.name}
                    </h3>
                    <p className='text-gray-600'>{selectedTeacher.subject}</p>
                    <p className='text-sm text-gray-500'>
                      {selectedTeacher.phone}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {teacherGroups.length}
                  </div>
                  <p className='text-sm text-gray-600'>Jami guruhlar</p>
                  <div className='mt-2 text-lg font-semibold text-green-600'>
                    {teacherGroups.reduce(
                      (sum, group) => sum + group.students,
                      0
                    )}{' '}
                    ta
                  </div>
                  <p className='text-sm text-gray-600'>Jami o'quvchilar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Groups Table */}
          <Card>
            <CardHeader>
              <CardTitle>Guruhlar Jadvali</CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guruh nomi</TableHead>
                    <TableHead>Jadval</TableHead>
                    <TableHead>O'quvchilar soni</TableHead>
                    <TableHead>Xona</TableHead>
                    <TableHead>Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className='font-medium'>
                        {group.name}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-gray-500' />
                          {group.schedule}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Users className='h-4 w-4 text-gray-500' />
                          {group.students} ta
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <MapPin className='h-4 w-4 text-gray-500' />
                          {group.room}-xona
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-2'>
                          <Button size='sm' variant='outline'>
                            O'quvchilar
                          </Button>
                          <Button size='sm' variant='outline'>
                            Tahrirlash
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleDeleteGroup(group.id)}
                            className='text-red-600 hover:bg-red-50 hover:text-red-700'
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>Eng katta guruh</p>
                    <p className='text-lg font-semibold'>
                      {Math.max(...teacherGroups.map((g) => g.students))} ta
                      o'quvchi
                    </p>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                    <Users className='h-6 w-6 text-green-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>Eng kichik guruh</p>
                    <p className='text-lg font-semibold'>
                      {Math.min(...teacherGroups.map((g) => g.students))} ta
                      o'quvchi
                    </p>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
                    <Users className='h-6 w-6 text-blue-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>
                      O'rtacha o'quvchilar
                    </p>
                    <p className='text-lg font-semibold'>
                      {Math.round(
                        teacherGroups.reduce(
                          (sum, group) => sum + group.students,
                          0
                        ) / teacherGroups.length
                      )}{' '}
                      ta
                    </p>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-100'>
                    <Users className='h-6 w-6 text-purple-600' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
