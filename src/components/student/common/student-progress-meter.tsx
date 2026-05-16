import { cn } from '@/lib/utils'

type StudentProgressMeterProps = {
  value: number
  className?: string
}

export function StudentProgressMeter({
  value,
  className,
}: StudentProgressMeterProps) {
  return (
    <progress
      max={100}
      value={Math.max(0, Math.min(100, value))}
      className={cn(
        'h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-rose-500 [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-rose-500',
        className
      )}
    />
  )
}
