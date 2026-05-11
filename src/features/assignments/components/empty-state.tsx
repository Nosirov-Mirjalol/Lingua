import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AssignmentsEmptyState() {
  return (
    <Card className='text-center'>
      <CardHeader>
        <CardTitle>No Assignments Found</CardTitle>
      </CardHeader>
      <CardContent className='py-12'>
        <div className='space-y-4'>
          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
            <Plus className='h-8 w-8 text-gray-400' />
          </div>
          <div>
            <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
              No assignments yet
            </h3>
            <p className='mx-auto mb-6 max-w-md text-gray-600 dark:text-gray-400'>
              Get started by creating your first assignment. You can add
              assignments for different groups and track student progress.
            </p>
          </div>
          <Button className='bg-[#e11d48] text-white hover:bg-[#be123c]'>
            <Plus className='mr-2 h-4 w-4' />
            Create First Assignment
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
