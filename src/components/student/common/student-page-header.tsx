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
    <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
      <div className='space-y-1.5'>
        {eyebrow ? (
          <div className='flex items-center gap-2 text-primary/80'>
            {icon}
            <p className='text-[10px] font-bold uppercase tracking-[0.25em] md:text-xs'>{eyebrow}</p>
          </div>
        ) : null}
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl'>{title}</h1>
          {description ? (
            <p className='mt-1 text-sm text-muted-foreground md:text-base'>{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className='flex flex-wrap gap-2 md:gap-3'>{actions}</div> : null}
    </div>
  )
}
