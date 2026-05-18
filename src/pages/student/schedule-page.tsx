import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import { useStudentSchedule } from '@/hooks/student/useStudentPortal'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentPageHeader } from '@/components/student/common/student-page-header'
import { Skeleton } from '@/components/ui/skeleton'

export function StudentSchedulePage() {
  const { data: schedule = [], isLoading } = useStudentSchedule()

  return (
    <div className='max-w-6xl space-y-6'>
      <StudentPageHeader
        title='Weekly class plan'
        eyebrow='Schedule'
        icon={<CalendarDays size={18} />}
      />

      <div className='grid gap-4 lg:grid-cols-3'>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : schedule.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-xl border">
            Dars jadvali topilmadi.
          </div>
        ) : (
          schedule.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <CardTitle className="text-base">{session.title}</CardTitle>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      {session.week_days_type} {session.week_days_names?.length 
                        ? `(${session.week_days_names.join(', ')})` 
                        : ' - No lesson days available'}
                    </p>
                  </div>
                  <Badge variant={session.status === 'Active' || session.status === 'Faol' ? 'secondary' : 'outline'}>
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Clock3 className="h-4 w-4" />
                  <span className="text-sm">{session.time}</span>
                </div>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Boshlanish: {session.start_date}</span>
                </div>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Tugash: {session.end_date}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
