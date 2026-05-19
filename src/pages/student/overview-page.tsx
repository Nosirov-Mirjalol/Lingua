import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  MessageSquare,
} from 'lucide-react'
import { useStudentDashboard, useStudentProfile } from '@/hooks/student/useStudentPortal'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StudentInfoTile } from '@/components/student/common/student-info-tile'
import { StudentPageHeader } from '@/components/student/common/student-page-header'
import { StudentProgressMeter } from '@/components/student/common/student-progress-meter'
import { StudentStatCard } from '@/components/student/common/student-stat-card'

export function StudentOverviewPage() {
  const { data: profile } = useStudentProfile()
  const { data: dashboard } = useStudentDashboard()
  const highlights = dashboard?.highlights ?? []
  const quickActions = dashboard?.quickActions ?? []

  return (
    <div className='mx-auto max-w-7xl space-y-6'>
      <section className='mb-7'>
        <StudentPageHeader
          title={`Xush kelibsiz, ${profile?.username ?? 'O‘quvchi'}`}
          description='Sizning shaxsiy talaba portalingiz tayyor. O‘qishda davom eting.'
        />
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <StudentStatCard
          title='Kelgusi darslar'
          value={dashboard?.stats.upcomingLessons ?? '-'}
          icon={<CalendarDays className='h-5 w-5 text-primary' />}
        />
        <StudentStatCard
          title='Kurs yakunlanishi'
          value={`${dashboard?.stats.progress ?? 0}%`}
          icon={<BookOpen className='h-5 w-5 text-primary' />}
        />
        <StudentStatCard
          title='O‘qilgan soatlar'
          value={dashboard?.stats.completedHours ?? '-'}
          icon={<ClipboardList className='h-5 w-5 text-primary' />}
        />
        <StudentStatCard
          title='O‘qilmagan xabarlar'
          value={dashboard?.stats.unreadMessages ?? '-'}
          icon={<MessageSquare className='h-5 w-5 text-primary' />}
        />
      </section>

      <section className='grid gap-4 xl:grid-cols-[1.5fr_1fr]'>
        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle className='text-primary'>Bugungi asosiy ko‘rsatkichlar</CardTitle>
            <CardDescription>
              Navbatdagi marrangizni kuzatib boring.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <div className='space-y-4'>
              <StudentInfoTile title='Navbatdagi dars' value={profile?.nextLesson ?? '-'} muted />
              <div className='flex flex-col gap-3 sm:flex-row'>
                <StudentInfoTile title='Faol kurs' value={profile?.activeCourse ?? '-'} />
                <StudentInfoTile title='Davomiylik' value={`${profile?.streak ?? 0} kun`} />
                <StudentInfoTile title='Davomat' value={`${profile?.attendance ?? 0}%`} />
              </div>
            </div>
            <div className='grid gap-3 md:grid-cols-2'>
              {highlights.map((highlight) => (
                <div
                  key={highlight.title}
                  className='rounded-3xl border border-primary/10 bg-primary/2 p-4 transition-colors hover:bg-primary/4'
                >
                  <p className='text-xs uppercase tracking-[0.18em] text-primary/70 font-bold'>
                    {highlight.title === 'Next lesson' ? 'Navbatdagi dars' : 
                     highlight.title === 'Active course' ? 'Faol kurs' : 
                     highlight.title === 'Streak' ? 'Davomiylik' : 
                     highlight.title === 'Attendance' ? 'Davomat' : highlight.title}
                  </p>
                  <p className='mt-2 text-base font-semibold text-foreground'>
                    {highlight.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='space-y-4 overflow-hidden'>
          <CardHeader>
            <CardTitle className='text-primary'>Tezkor harakatlar</CardTitle>
            <CardDescription>Eng muhim keyingi qadamlarga o‘ting.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {quickActions.map((action) => (
              <div
                key={action.label}
                className='flex items-center justify-between rounded-3xl border border-primary/10 bg-primary/2 p-4 transition-all hover:bg-primary/5 cursor-pointer group'
              >
                <div>
                  <p className='font-bold text-foreground group-hover:text-primary transition-colors'>
                    {action.label === 'View Schedule' ? 'Jadvalni ko‘rish' : 
                     action.label === 'Check Homework' ? 'Vazifalarni tekshirish' : 
                     action.label === 'Messages' ? 'Xabarlar' : action.label}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {action.description === 'See your upcoming classes' ? 'Kelgusi darslaringizni ko‘ring' : 
                     action.description === 'View assigned tasks' ? 'Tayinlangan vazifalarni ko‘ring' : 
                     action.description === 'Read teacher feedback' ? 'Ustoz fikrlarini o‘qing' : action.description}
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 text-primary/50 group-hover:text-primary group-hover:translate-x-1 transition-all' />
              </div>
            ))}
            <div className='mt-4'>
              <StudentInfoTile title='Maqsad' value={profile?.learning_goal ?? '-'} muted />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2 overflow-hidden'>
          <CardHeader>
            <CardTitle className='text-primary'>To‘xtagan joyingizdan davom eting</CardTitle>
            <CardDescription>Oxirgi modullaringizni yakunlang.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-3 sm:grid-cols-2'>
              <ProgressTile title='Talaffuz laboratoriyasi' value='78%' />
              <ProgressTile title='Grammatika bo‘yicha seminar' value='65%' />
            </div>
          </CardContent>
        </Card>

        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle className='text-primary'>E’tibor bering</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2'>
            <Badge className='rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10'>
              Yangi modul mavjud
            </Badge>
            <Badge className='rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'>
              Fikr-mulohaza tayyor
            </Badge>
            <Badge className='rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'>
              Ertaga jonli dars
            </Badge>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function ProgressTile({ title, value }: { title: string; value: string }) {
  const numericValue = Number.parseInt(value, 10) || 0

  return (
    <div className='rounded-3xl border bg-muted/50 p-4'>
      <p className='text-sm text-muted-foreground'>{title}</p>
      <div className='mt-3 flex items-center gap-3'>
        <p className='text-2xl font-semibold text-foreground'>{value}</p>
        <StudentProgressMeter value={numericValue} className='flex-1' />
      </div>
    </div>
  )
}
