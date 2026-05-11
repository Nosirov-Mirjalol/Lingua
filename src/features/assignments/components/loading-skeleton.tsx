import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function AssignmentsLoadingSkeleton() {
  return (
    <div className='space-y-6'>
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <Card key={index} className='animate-pulse'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='space-y-2'>
                <Skeleton className='h-6 w-48' />
                <Skeleton className='h-4 w-32' />
              </div>
              <div className='flex gap-2'>
                <Skeleton className='h-8 w-8' />
                <Skeleton className='h-8 w-8' />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <Skeleton className='mb-2 h-4 w-full' />
                <Skeleton className='h-16 w-full' />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Skeleton className='mb-2 h-4 w-16' />
                  <Skeleton className='h-8 w-20' />
                </div>
                <div>
                  <Skeleton className='mb-2 h-4 w-16' />
                  <Skeleton className='h-8 w-24' />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
