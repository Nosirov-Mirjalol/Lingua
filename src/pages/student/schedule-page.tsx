import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import { useStudentSchedule } from '@/hooks/student/useStudentPortal'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentPageHeader } from '@/components/student/common/student-page-header'
import { Skeleton } from '@/components/ui/skeleton'

export function StudentSchedulePage() {
  const { data: schedule = [], isLoading } = useStudentSchedule()

  return (
    <div className='mx-auto max-w-7xl space-y-6'>
      <StudentPageHeader
        title='Haftalik dars rejasi'
        eyebrow='Dars jadvali'
        icon={<CalendarDays size={18} />}
      />

      <div className='grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className='overflow-hidden border-primary/10'>
              <div className='h-1.5 bg-muted' />
              <CardHeader className='pb-3'>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className='flex items-center gap-2.5'>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className='flex items-center gap-2.5'>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className='flex items-center gap-2.5'>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : schedule.length === 0 ? (
          <div className="col-span-full py-12 text-center text-primary bg-primary/5 rounded-xl border border-primary/40 font-medium">
            Dars jadvali topilmadi.
          </div>
        ) : (
          schedule.map((session) => (
            <Card key={session.id} className='overflow-hidden border-primary/70 transition-all hover:border-primary/80 hover:shadow-md'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <CardTitle className="text-base font-bold text-primary">{session.title}</CardTitle>
                    <p className='mt-1 text-xs font-medium text-muted-foreground'>
                      {session.week_days_type === 'Even days' ? 'Juft kunlar' : 
                       session.week_days_type === 'Odd days' ? 'Toq kunlar' : session.week_days_type} 
                      {session.week_days_names?.length 
                        ? `(${session.week_days_names.map(day => 
                            day === 'Monday' ? 'Dushanba' : 
                            day === 'Tuesday' ? 'Seshanba' : 
                            day === 'Wednesday' ? 'Chorshanba' : 
                            day === 'Thursday' ? 'Payshanba' : 
                            day === 'Friday' ? 'Juma' : 
                            day === 'Saturday' ? 'Shanba' : 
                            day === 'Sunday' ? 'Yakshanba' : day
                          ).join(', ')})` 
                        : ' - Dars kunlari mavjud emas'}
                    </p>
                  </div>
                  <Badge 
                    variant={session.status === 'Active' || session.status === 'Faol' ? 'default' : 'outline'}
                    className={session.status === 'Active' || session.status === 'Faol' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}
                  >
                    {session.status === 'Active' ? 'Faol' : session.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-3 pt-0'>
                <div className='flex items-center gap-2.5 text-muted-foreground'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary'>
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{session.time}</span>
                </div>
                <div className='flex items-center gap-2.5 text-muted-foreground'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary'>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Boshlanish: {session.start_date}</span>
                </div>
                <div className='flex items-center gap-2.5 text-muted-foreground'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary'>
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Tugash: {session.end_date}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
