import { createFileRoute } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { useAdminCourses } from '@/hooks/admin/courses/useAdminCourses'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_authenticated/student/courses')({
  component: StudentCoursesPage,
})

function CourseCardSkeleton() {
  return (
    <Card className='border-border/60 bg-card/80'>
      <CardHeader className='space-y-3'>
        <Skeleton className='h-6 w-2/3' />
        <Skeleton className='h-4 w-1/3' />
      </CardHeader>
      <CardContent className='pt-0'>
        <Skeleton className='h-20 w-full rounded-2xl' />
      </CardContent>
    </Card>
  )
}

function StudentCoursesPage() {
  const { data: courses = [], isLoading, isError } = useAdminCourses('')

  return (
    <div className='max-w-7xl space-y-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-3xl font-semibold text-foreground'>
            My Group
          </h1>
        </div>
        <Badge className='rounded-full bg-rose-100 px-3 py-1 text-rose-700'>
          {courses.length} ta guruh
        </Badge>
      </div>

      {isLoading ? (
        <div className='grid gap-4 xl:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <Card className='border-dashed'>
          <CardContent className='py-10 text-center'>
            <BookOpen className='mx-auto mb-3 h-10 w-10 text-muted-foreground' />
            <p className='text-base font-semibold text-foreground'>
              Guruhlar hozircha mavjud emas
            </p>
          </CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='py-10 text-center'>
            <BookOpen className='mx-auto mb-3 h-10 w-10 text-muted-foreground' />
            <p className='text-base font-semibold text-foreground'>
              Guruhlar hozircha mavjud emas
            </p>
            <p className='mt-2 text-sm text-muted-foreground'>
              Siz birorta guruhga a&apos;zo emassiz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 xl:grid-cols-3'>
          {courses.map((course) => (
            <Card
              key={course.id}
              className='border-border/60 bg-card/90 transition-transform hover:-translate-y-0.5'
            >
              <CardHeader className='space-y-2'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0 flex-1'>
                    <CardTitle className='truncate'>{course.name}</CardTitle>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      Group ID: #{course.id}
                    </p>
                  </div>
                  <Badge className='rounded-full bg-muted text-muted-foreground'>
                    Group
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground'>
                  Siz a&apos;zo bo&apos;lgan guruh ma&apos;lumotlari.
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

