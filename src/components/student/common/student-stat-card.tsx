import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

type StudentStatCardProps = {
  title: string
  value: number | string
  icon: ReactNode
}

export function StudentStatCard({
  title,
  value,
  icon,
}: StudentStatCardProps) {
  return (
    <Card>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between text-muted-foreground'>
          <p className='text-sm font-medium'>{title}</p>
          <span className='rounded-2xl bg-muted p-2 text-foreground'>{icon}</span>
        </div>
        <p className='text-3xl font-semibold text-foreground'>{value}</p>
      </CardContent>
    </Card>
  )
}
