import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, Trophy } from 'lucide-react'
import { useStudentCourses } from '@/hooks/student/useStudentPortal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_authenticated/student/courses')({
  component: StudentCoursesPage,
})

function StudentCoursesPage() {
  const { data: courses = [] } = useStudentCourses()

  return (
    <div className='max-w-7xl space-y-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm uppercase tracking-[0.2em] text-muted-foreground'>Courses</p>
          <h1 className='text-3xl font-semibold text-foreground'>Learning path</h1>
        </div>
        <Button>
          <Trophy className='mr-2 h-4 w-4' />
          View certifications
        </Button>
      </div>

      <div className='grid gap-4 xl:grid-cols-3'>
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <CardTitle>{course.title}</CardTitle>
                  <p className='text-sm text-muted-foreground'>{course.instructor}</p>
                </div>
                <Badge className='rounded-full bg-muted text-muted-foreground'>
                  {course.badge}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-3xl bg-muted/50 p-4'>
                <p className='text-sm text-muted-foreground'>Progress</p>
                <div className='mt-3 h-2 overflow-hidden rounded-full bg-muted'>
                  <div
                    className='h-2 rounded-full bg-rose-500'
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <p className='mt-2 text-sm font-semibold text-foreground'>
                  {course.progress}% complete
                </p>
              </div>
              <div className='flex items-center justify-between text-sm text-muted-foreground'>
                <span>{course.duration}</span>
                <span>{course.nextModule}</span>
              </div>
              <Link
                to='/student/homework'
                className='inline-flex items-center gap-2 text-sm font-semibold text-rose-600'
              >
                Continue course <ChevronRight size={16} />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
