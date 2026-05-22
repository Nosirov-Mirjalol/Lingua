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
import { DashboardCard } from '@/components/dashboard-card'

export function StudentOverviewPage() {
  const { data: profile } = useStudentProfile()
  const { data: dashboard } = useStudentDashboard()
  const highlights = dashboard?.highlights ?? []
  const quickActions = dashboard?.quickActions ?? []

  return (
    <div className='mx-auto max-w-7xl space-y-6'>
      <section className='mb-7'>
        <StudentPageHeader
          title={`Xush kelibsiz, ${profile?.full_name || profile?.username || ''}`}
          description='Sizning shaxsiy talaba portalingiz tayyor. O‘qishda davom eting.'
        />
      </section>

      <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <DashboardCard
          title='Kelgusi darslar'
          value={String(dashboard?.stats.upcomingLessons ?? 0)}
          icon={CalendarDays}
          size='sm'
          valueClassName='text-base'
        />
        <DashboardCard
          title='Dars kunlari'
          value={dashboard?.stats.lessonDays || 'Yuklanmoqda...'}
          icon={ClipboardList}
          size='sm'
          valueClassName='text-base'
        />
        <DashboardCard
          title='O‘qilmagan xabarlar'
          value={String(dashboard?.stats.unreadMessages ?? 0)}
          icon={MessageSquare}
          size='sm'
          valueClassName='text-2xl'
        />
      </section>

      <section className='grid gap-4 lg:grid-cols-[1.5fr_1fr]'>
        <Card className='overflow-hidden border-primary/70 transition-all hover:border-primary/80 hover:shadow-md'>
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
                  className='rounded-3xl border border-primary/40 bg-card p-4 transition-all hover:border-primary/60 hover:shadow-md'
                >
                  <p className='text-xs uppercase tracking-[0.18em] text-primary/70 font-bold'>
                    {highlight.title === 'Next lesson' ? 'Navbatdagi dars' : 
                     highlight.title === 'Active course' ? 'Faol guruh' : 
                     highlight.title === 'Streak' ? 'Davomiylik' : 
                     highlight.title === 'Learning streak' ? 'Davomiylik' :
                     highlight.title === 'Topshirilgan vazifalar' ? 'Vazifalar' : highlight.title}
                  </p>
                  <p className='mt-2 text-base font-semibold text-foreground'>
                    {highlight.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='space-y-4 overflow-hidden border-primary/70 transition-all hover:border-primary/80 hover:shadow-md'>
          <CardHeader>
            <CardTitle className='text-primary'>Tezkor harakatlar</CardTitle>
            <CardDescription>Eng muhim keyingi qadamlarga o‘ting.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {quickActions.map((action) => (
                <div
                  key={action.label}
                  className='flex items-center justify-between rounded-3xl border border-primary/40 bg-card p-4 transition-all hover:border-primary/60 hover:shadow-md cursor-pointer group'
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

    </div>
  )
}
