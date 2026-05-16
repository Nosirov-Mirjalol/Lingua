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
    <div className='max-w-7xl space-y-6'>
      <section className='mb-7'>
        <StudentPageHeader
          title={`Welcome back, ${profile?.username ?? 'Learner'}`}
          description='Your personal student portal is ready. Keep the momentum going.'
        />
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <StudentStatCard
          title='Upcoming lessons'
          value={dashboard?.stats.upcomingLessons ?? '-'}
          icon={<CalendarDays className='h-5 w-5' />}
        />
        <StudentStatCard
          title='Course completion'
          value={`${dashboard?.stats.progress ?? 0}%`}
          icon={<BookOpen className='h-5 w-5' />}
        />
        <StudentStatCard
          title='Hours studied'
          value={dashboard?.stats.completedHours ?? '-'}
          icon={<ClipboardList className='h-5 w-5' />}
        />
        <StudentStatCard
          title='Unread messages'
          value={dashboard?.stats.unreadMessages ?? '-'}
          icon={<MessageSquare className='h-5 w-5' />}
        />
      </section>

      <section className='grid gap-4 xl:grid-cols-[1.5fr_1fr]'>
        <Card>
          <CardHeader>
            <CardTitle>Today's learning highlight</CardTitle>
            <CardDescription>
              Keep your next milestone visible and on track.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <div className='space-y-4'>
              <StudentInfoTile title='Next lesson' value={profile?.nextLesson ?? '-'} muted />
              <div className='flex flex-col gap-3 sm:flex-row'>
                <StudentInfoTile title='Active course' value={profile?.activeCourse ?? '-'} />
                <StudentInfoTile title='Streak' value={`${profile?.streak ?? 0} days`} />
                <StudentInfoTile title='Attendance' value={`${profile?.attendance ?? 0}%`} />
              </div>
            </div>
            <div className='grid gap-3 md:grid-cols-2'>
              {highlights.map((highlight) => (
                <div
                  key={highlight.title}
                  className='rounded-3xl border bg-card p-4'
                >
                  <p className='text-xs uppercase tracking-[0.18em] text-muted-foreground'>
                    {highlight.title}
                  </p>
                  <p className='mt-2 text-base font-semibold text-foreground'>
                    {highlight.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='space-y-4'>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump into the most important next steps.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {quickActions.map((action) => (
              <div
                key={action.label}
                className='flex items-center justify-between rounded-3xl border bg-card p-4'
              >
                <div>
                  <p className='font-medium text-foreground'>{action.label}</p>
                  <p className='text-sm text-muted-foreground'>{action.description}</p>
                </div>
                <ArrowRight className='h-5 w-5 text-muted-foreground' />
              </div>
            ))}
            <StudentInfoTile title='Goal' value={profile?.goal ?? '-'} muted />
          </CardContent>
        </Card>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Continue where you left off</CardTitle>
            <CardDescription>Resume your most recent modules.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-3 sm:grid-cols-2'>
              <ProgressTile title='Pronunciation Lab' value='78%' />
              <ProgressTile title='Grammar Workshop' value='65%' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keep an eye on</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Badge className='rounded-full border bg-muted text-muted-foreground'>
              New module available
            </Badge>
            <Badge className='rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'>
              Feedback ready
            </Badge>
            <Badge className='rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'>
              Live class tomorrow
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
