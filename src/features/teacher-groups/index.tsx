import { Link, useParams } from '@tanstack/react-router'
import { Calendar, ChevronLeft, MapPin, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { Group } from '@/api/service/teacher/group.type'
import { useAdminGroups } from '@/hooks/admin/groups/useAdminGroups'
import { useDeleteAdminGroup } from '@/hooks/admin/groups/useDeleteAdminGroup'
import { useAdminTeachers } from '@/hooks/admin/teachers/useAdminTeachers'
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
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

const formatGroupSchedule = (group: Group) => {
  const weekDays = Array.isArray(group.week_days)
    ? group.week_days.join(', ')
    : group.week_days
  const time = [group.start_time?.slice(0, 5), group.end_time?.slice(0, 5)]
    .filter(Boolean)
    .join('-')

  return [weekDays, time].filter(Boolean).join(' ') || '-'
}

export default function TeacherGroupsPage() {
  const { teacherId } = useParams({
    from: '/_authenticated/teachers/$teacherId/groups/',
  })
  const teacherIdNum = parseInt(teacherId)
  const { data: teachers = [], isLoading: teachersLoading } = useAdminTeachers()
  const { data: groups = [], isLoading: groupsLoading } = useAdminGroups()
  const deleteGroupMutation = useDeleteAdminGroup()

  const selectedTeacher = teachers.find((t) => t.id === teacherIdNum)
  const teacherName = selectedTeacher
    ? `${selectedTeacher.first_name} ${selectedTeacher.last_name}`.trim() ||
      selectedTeacher.username
    : ''
  const teacherGroups = groups.filter((group) => group.teacher === teacherIdNum)

  const handleDeleteGroup = (groupId: number) => {
    if (!window.confirm("Ushbu guruhni o'chirishni xohlaysizmi?")) return

    toast.promise(deleteGroupMutation.mutateAsync(groupId), {
      loading: "Guruh o'chirilmoqda...",
      success: "Guruh muvaffaqiyatli o'chirildi",
      error: "Guruhni o'chirishda xatolik yuz berdi",
    })
  }

  if (teachersLoading || groupsLoading) {
    return (
      <>
        <Header>
          <div className='ms-auto flex items-center space-x-2'>
            <Search />
            <ThemeSwitch />
            <ConfigDrawer />
          </div>
        </Header>
        <Main className='bg-background'>
          <div className='container mx-auto p-6 text-center text-muted-foreground'>
            Yuklanmoqda...
          </div>
        </Main>
      </>
    )
  }

  if (!selectedTeacher) {
    return (
      <>
        <Header>
          <div className='ms-auto flex items-center space-x-2'>
            <Search />
            <ThemeSwitch />
            <ConfigDrawer />
          </div>
        </Header>
        <Main className='bg-background'>
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
              <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
                <Users className='h-12 w-12 text-red-600 dark:text-red-400' />
              </div>
              <h1 className='mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100'>
                Ustoz topilmadi
              </h1>
              <p className='mb-6 text-gray-600 dark:text-gray-400'>
                ID: {teacherId} bo'yicha ustoz ma'lumotlari topilmadi
              </p>
              <div className='mx-auto mb-6 max-w-md text-left'>
                <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                  Mumkin bo'lgan sabablar:
                </p>
                <ul className='list-inside list-disc text-sm text-gray-600 dark:text-gray-400'>
                  <li>Ustoz o'chirilgan bo'lishi mumkin</li>
                  <li>
                    Ustoz ma'lumotlari noto'g'ri saqlangan bo'lishi mumkin
                  </li>
                  <li>URL manzili xato bo'lishi mumkin</li>
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

  // Check if teacher has no groups
  if (teacherGroups.length === 0) {
    return (
      <>
        <Header>
          <div className='ms-auto flex items-center space-x-2'>
            <Search />
            <ThemeSwitch />
            <ConfigDrawer />
          </div>
        </Header>
        <Main className='bg-background'>
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
              {teacherName} - GURUHLAR
            </span>
          </div>
          <div className='container mx-auto p-6'>
            <div className='text-center'>
              <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
                <Users className='h-12 w-12 text-gray-400 dark:text-gray-500' />
              </div>
              <h1 className='mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {teacherName} - Guruhlari yo'q
              </h1>
              <p className='mb-6 text-gray-600 dark:text-gray-400'>
                Ushbu ustoz hali hech qanday guruhga biriktirilmagan
              </p>
              <div className='mb-6'>
                <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                  Ustoz ma'lumotlari:
                </p>
                <div className='inline-block rounded-lg bg-gray-50 p-4 text-left dark:bg-gray-800'>
                  <p className='font-semibold text-gray-900 dark:text-gray-100'>
                    {teacherName}
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
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
        <div className='ms-auto flex items-center space-x-2'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
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
            {teacherName} - GURUHLAR
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
                {teacherName} - Guruhlari
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
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30'>
                    <Users className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold'>
                      {teacherName}
                    </h3>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
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
                      (sum, group) => sum + (group.students?.length ?? 0),
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
                          {formatGroupSchedule(group)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Users className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                          {group.students?.length ?? 0} ta
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <MapPin className='h-4 w-4 text-gray-500' />
                          -
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
                            className='text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300'
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
                      {Math.max(
                        ...teacherGroups.map((g) => g.students?.length ?? 0)
                      )}{' '}
                      ta
                      o'quvchi
                    </p>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
                    <Users className='h-6 w-6 text-green-600 dark:text-green-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Eng kichik guruh
                    </p>
                    <p className='text-lg font-semibold'>
                      {Math.min(
                        ...teacherGroups.map((g) => g.students?.length ?? 0)
                      )}{' '}
                      ta
                      o'quvchi
                    </p>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30'>
                    <Users className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      O'rtacha o'quvchilar
                    </p>
                    <p className='text-lg font-semibold'>
                      {Math.round(
                        teacherGroups.reduce(
                          (sum, group) => sum + (group.students?.length ?? 0),
                          0
                        ) / teacherGroups.length
                      )}{' '}
                      ta
                    </p>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
                    <Users className='h-6 w-6 text-purple-600 dark:text-purple-400' />
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
