import { BookOpen, CalendarDays, Clock3, MapPin, User, Users } from 'lucide-react'
import { useStudentGroups } from '@/hooks/student/useStudentPortal'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StudentPageHeader } from '@/components/student/common/student-page-header'

export function StudentGroupsPage() {
  const { data: groups, isLoading, error } = useStudentGroups()

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <h1 className='text-2xl font-bold'>Mening guruhlarim</h1>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <Card key={i} className='overflow-hidden'>
              <CardHeader className='pb-2'>
                <Skeleton className='h-6 w-2/3' />
                <Skeleton className='h-4 w-1/2' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-20 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-6 text-center'>
        <h1 className='text-2xl font-bold text-red-500'>Guruhlarni yuklashda xatolik</h1>
        <p className='text-muted-foreground'>Iltimos, keyinroq qayta urinib ko‘ring.</p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-7xl space-y-6'>
      <StudentPageHeader
        title='Mening guruhlarim'
        description='Sizga biriktirilgan o‘quv guruhlarini ko‘ring va boshqaring.'
      />

      {!groups || groups.length === 0 ? (
        <Card className='flex flex-col items-center justify-center p-12 text-center'>
          <BookOpen className='mb-4 h-12 w-12 text-muted-foreground' />
          <CardTitle>Guruhlar topilmadi</CardTitle>
          <CardDescription>
            Hozirda siz hech qanday guruhga a’zo emassiz.
          </CardDescription>
        </Card>
      ) : (
        <div className='grid gap-4 lg:grid-cols-3'>
          {groups.map((group) => (
            <Card key={group.id} className='overflow-hidden border-primary/20 transition-all hover:border-primary/30 hover:shadow-md flex flex-col'>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <CardTitle className='text-base font-bold text-primary'>{group.name}</CardTitle>
                    <p className='mt-1 text-xs font-medium text-muted-foreground line-clamp-2'>
                      {group.course_name || group.description || 'Kurs haqida ma’lumot yo‘q.'}
                    </p>
                  </div>
                  <Badge 
                    variant={group.status === 'active' || group.status === 'Faol' ? 'default' : 'outline'}
                    className={group.status === 'active' || group.status === 'Faol' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}
                  >
                    {group.status === 'active' ? 'Faol' : group.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='flex flex-1 flex-col justify-between gap-4 pt-0'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2.5 text-muted-foreground'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary'>
                      <Clock3 className='h-4 w-4' />
                    </div>
                    <span className='text-sm font-medium'>
                      {group.start_time || 'TBA'}{group.end_time ? ` — ${group.end_time}` : ''}
                    </span>
                  </div>

                  <div className='flex items-center gap-2.5 text-muted-foreground'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary'>
                      <CalendarDays className='h-4 w-4' />
                    </div>
                    <span className='text-sm font-medium'>
                      {group.week_days_active || group.week_days_label || group.week_days || 'Hafta kunlari yo‘q'}
                    </span>
                  </div>

                  <div className='flex items-center gap-2.5 text-muted-foreground'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary'>
                      <MapPin className='h-4 w-4' />
                    </div>
                    <span className='text-sm font-medium text-wrap'>
                      {group.start_date || '—'} — {group.end_date || '—'}
                    </span>
                  </div>

                  <div className='flex items-center gap-2.5 text-muted-foreground'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary'>
                      <Users className='h-4 w-4' />
                    </div>
                    <span className='text-sm font-medium'>{group.student_count ?? '—'} talaba</span>
                  </div>
                </div>

                <div className='border-t border-primary/5 pt-3 mt-auto'>
                  <div className='flex items-center gap-2.5 text-muted-foreground'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary'>
                      <User className='h-4 w-4' />
                    </div>
                    <span className='text-sm font-medium'>
                      Ustoz: {group.teacher?.full_name || group.teacher_name || 'Ustoz nomi yo‘q'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
