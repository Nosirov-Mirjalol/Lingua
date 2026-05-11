import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { HomeworkStatus } from '@/types/student'

interface Props {
  status: HomeworkStatus
}

export function HomeworkStatusBadge({ status }: Props) {
  const styles: Record<HomeworkStatus, string> = {
    pending: 'border-muted-foreground text-muted-foreground',
    submitted: 'border-blue-500 text-blue-500',
    late: 'bg-red-500 text-white border-red-500',
    completed: 'bg-green-500 text-white border-green-500',
  }

  return (
    <Badge variant='outline' className={cn('rounded-full', styles[status])}>
      {status.toUpperCase()}
    </Badge>
  )
}
