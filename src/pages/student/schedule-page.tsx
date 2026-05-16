import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import { useStudentSchedule } from '@/hooks/student/useStudentPortal'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentPageHeader } from '@/components/student/common/student-page-header'

export function StudentSchedulePage() {
  const { data: schedule = [] } = useStudentSchedule()

  return (
    <div className='max-w-6xl space-y-6'>
      <StudentPageHeader
        title='Weekly class plan'
        eyebrow='Schedule'
        icon={<CalendarDays size={18} />}
      />

      <div className='grid gap-4 lg:grid-cols-3'>
        {schedule.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <CardTitle>{session.title}</CardTitle>
                  <p className='mt-1 text-sm text-muted-foreground'>{session.day}</p>
                </div>
                <Badge variant={session.status === 'Live' ? 'secondary' : 'outline'}>
                  {session.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Clock3 />
                <span>{session.time}</span>
              </div>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <MapPin />
                <span>{session.location}</span>
              </div>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Users />
                <span>{session.instructor}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
