import { useRouterState } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { ThemeSwitch } from '@/components/theme-switch'

type AdminHeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
}

export function AdminHeader({
  className,
  fixed,
  children,
  ...props
}: AdminHeaderProps) {
  const routerStatus = useRouterState({
    select: (state) => state.status,
  })

  return (
    <Header fixed={fixed} className={className} {...props}>
      <div className='ms-auto flex items-center gap-2 sm:gap-3'>
        {routerStatus === 'pending' ? (
          <span className='inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
            Loading
          </span>
        ) : null}
        <ThemeSwitch />
        {children}
      </div>
    </Header>
  )
}
