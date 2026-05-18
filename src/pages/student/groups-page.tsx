import { BookOpen, Calendar, Clock, User } from 'lucide-react'
import { useStudentGroups } from '@/hooks/student/useStudentPortal'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StudentPageHeader } from '@/components/student/common/student-page-header'

export function StudentGroupsPage() {
  const { data: groups, isLoading, error } = useStudentGroups()

  if (isLoading) {
    return (
      <div className='space-y-4 p-6'>
        <h1 className='text-2xl font-bold'>My Groups</h1>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <Card key={i} className='overflow-hidden'>
              <CardHeader className='pb-2'>
                <Skeleton className='h-6 w-2/3' />
                <Skeleton className='h-4 w-1/2' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-20 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-6 text-center'>
        <h1 className='text-2xl font-bold text-destructive'>
          Error loading groups
        </h1>
        <p className='text-muted-foreground'>Please try again later.</p>
      </div>
    )
  }

  return (
    <div className='space-y-6 p-6'>
      <StudentPageHeader
        title='My Groups'
        description='View and manage your assigned learning groups.'
      />

      {!groups || groups.length === 0 ? (
        <Card className='flex flex-col items-center justify-center p-12 text-center'>
          <BookOpen className='mb-4 h-12 w-12 text-muted-foreground' />
          <CardTitle>No groups found</CardTitle>
          <CardDescription>
            You are not currently assigned to any groups.
          </CardDescription>
        </Card>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {groups.map((group) => (
            <Card
              key={group.id}
              className='flex flex-col transition-shadow hover:shadow-md'
            >
              <CardHeader>
                <div className='mb-2 flex items-center justify-between'>
                  <Badge
                    variant={
                      group.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {group.status || 'Active'}
                  </Badge>
                </div>
                <CardTitle className='line-clamp-1'>{group.name}</CardTitle>
                <CardDescription className='line-clamp-2'>
                  {group.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>
              <CardContent className='flex-1 space-y-4'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='flex items-center text-muted-foreground'>
                    <Calendar className='mr-2 h-4 w-4' />
                    <span>{group.start_date || 'TBA'}</span>
                  </div>
                  <div className='flex items-center text-muted-foreground'>
                    <Clock className='mr-2 h-4 w-4' />
                    <span>{group.start_time || 'TBA'}</span>
                  </div>
                </div>
                {group.teacher && (
                  <div className='flex items-center border-t pt-4'>
                    <User className='mr-2 h-4 w-4 text-primary' />
                    <span className='text-sm font-medium'>
                      Teacher: {group.teacher.full_name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
