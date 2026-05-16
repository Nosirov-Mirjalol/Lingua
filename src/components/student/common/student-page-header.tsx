import type { ReactNode } from 'react'

type StudentPageHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
  icon?: ReactNode
  actions?: ReactNode
}

export function StudentPageHeader({
  title,
  description,
  eyebrow,
  icon,
  actions,
}: StudentPageHeaderProps) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <div className='space-y-2'>
        {eyebrow ? (
          <div className='flex items-center gap-2 text-muted-foreground'>
            {icon}
            <p className='text-sm uppercase tracking-[0.2em]'>{eyebrow}</p>
          </div>
        ) : null}
        <div>
          <h1 className='text-3xl font-semibold text-foreground'>{title}</h1>
          {description ? (
            <p className='mt-2 text-sm text-muted-foreground'>{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className='flex flex-wrap gap-3'>{actions}</div> : null}
    </div>
  )
}
