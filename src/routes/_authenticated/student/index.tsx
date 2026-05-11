import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, CalendarDays, ClipboardList, MessageSquare } from 'lucide-react'
import { useStudentDashboard, useStudentProfile } from '@/hooks/student/useStudentPortal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/student/')({
  component: StudentOverviewPage,
})

function StudentOverviewPage() {
  const { data: profile } = useStudentProfile()
  const { data: dashboard } = useStudentDashboard()

  return (
    <div className='mx-auto max-w-7xl space-y-6'>
      <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <h1 className='text-3xl font-semibold text-slate-900'>
              Welcome back, {profile?.username ?? 'Learner'}
            </h1>
            <p className='mt-2 text-sm text-slate-600'>
              Your personal student portal is ready. Keep the momentum going.
            </p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <Link to='/student/schedule'>
              <Button variant='outline'>View schedule</Button>
            </Link>
            <Link to='/student/homework'>
              <Button>Open assignments</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <DashboardCard
          title='Upcoming lessons'
          value={dashboard?.stats.upcomingLessons ?? '–'}
          icon={<CalendarDays className='h-5 w-5' />}
        />
        <DashboardCard
          title='Course completion'
          value={`${dashboard?.stats.progress ?? 0}%`}
          icon={<BookOpen className='h-5 w-5' />}
        />
        <DashboardCard
          title='Hours studied'
          value={dashboard?.stats.completedHours ?? '–'}
          icon={<ClipboardList className='h-5 w-5' />}
        />
        <DashboardCard
          title='Unread messages'
          value={dashboard?.stats.unreadMessages ?? '–'}
          icon={<MessageSquare className='h-5 w-5' />}
        />
      </section>

      <section className='grid gap-4 xl:grid-cols-[1.5fr_1fr]'>
        <Card>
          <CardHeader>
            <CardTitle>Today’s learning highlight</CardTitle>
            <CardDescription>
              Keep your next milestone visible and on track.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <div className='space-y-4'>
              <div className='rounded-3xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-sm font-medium text-slate-500'>Next lesson</p>
                <p className='mt-2 text-lg font-semibold text-slate-900'>
                  {profile?.nextLesson}
                </p>
              </div>
              <div className='flex flex-col gap-3 sm:flex-row'>
                <DetailPill title='Active course' value={profile?.activeCourse ?? '—'} />
                <DetailPill title='Streak' value={`${profile?.streak ?? 0} days`} />
                <DetailPill title='Attendance' value={`${profile?.attendance ?? 0}%`} />
              </div>
            </div>
            <div className='grid gap-3 md:grid-cols-2'>
              {dashboard?.highlights.map((highlight) => (
                <div
                  key={highlight.title}
                  className='rounded-3xl border border-slate-200 bg-white p-4'
                >
                  <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>
                    {highlight.title}
                  </p>
                  <p className='mt-2 text-base font-semibold text-slate-900'>
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
            {dashboard?.quickActions.map((action) => (
              <div
                key={action.label}
                className='flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4'
              >
                <div>
                  <p className='font-medium text-slate-900'>{action.label}</p>
                  <p className='text-sm text-slate-500'>{action.description}</p>
                </div>
                <ArrowRight className='h-5 w-5 text-slate-400' />
              </div>
            ))}
            <div className='rounded-3xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm text-slate-600'>Goal</p>
              <p className='mt-1 text-base font-semibold text-slate-900'>
                {profile?.goal}
              </p>
            </div>
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
            <Badge className='rounded-full bg-slate-100 text-slate-700'>
              New module available
            </Badge>
            <Badge className='rounded-full bg-emerald-100 text-emerald-700'>
              Feedback ready
            </Badge>
            <Badge className='rounded-full bg-amber-100 text-amber-700'>
              Live class tomorrow
            </Badge>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function DashboardCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between text-slate-500'>
          <p className='text-sm font-medium'>{title}</p>
          <span className='rounded-2xl bg-slate-100 p-2 text-slate-700'>{icon}</span>
        </div>
        <p className='text-3xl font-semibold text-slate-900'>{value}</p>
      </CardContent>
    </Card>
  )
}

function DetailPill({ title, value }: { title: string; value: string }) {
  return (
    <div className='rounded-3xl border border-slate-200 bg-white p-4'>
      <p className='text-sm text-slate-500'>{title}</p>
      <p className='mt-2 text-base font-semibold text-slate-900'>{value}</p>
    </div>
  )
}

function ProgressTile({ title, value }: { title: string; value: string }) {
  return (
    <div className='rounded-3xl border border-slate-200 bg-slate-50 p-4'>
      <p className='text-sm text-slate-500'>{title}</p>
      <div className='mt-3 flex items-center gap-3'>
        <p className='text-2xl font-semibold text-slate-900'>{value}</p>
        <div className='flex-1 overflow-hidden rounded-full bg-slate-200'>
          <div className='h-2 rounded-full bg-rose-500' style={{ width: value }} />
        </div>
      </div>
    </div>
  )
}
