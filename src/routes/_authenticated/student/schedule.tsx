import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import { useStudentSchedule } from '@/hooks/student/useStudentPortal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_authenticated/student/schedule')({
  component: StudentSchedulePage,
})

function StudentSchedulePage() {
  const { data: schedule = [] } = useStudentSchedule()

  return (
    <div className='max-w-6xl space-y-6'>
      <div className='space-y-2'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <CalendarDays size={18} />
          <p className='text-sm uppercase tracking-[0.2em]'>Schedule</p>
        </div>
        <h1 className='text-3xl font-semibold text-foreground'>Weekly class plan</h1>
      </div>

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
