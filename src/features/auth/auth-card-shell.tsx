import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from './auth-layout'

type AuthCardShellProps = {
  title: string
  description: string
  children: ReactNode
}

export function AuthCardShell({
  title,
  description,
  children,
}: AuthCardShellProps) {
  return (
    <AuthLayout>
      <Card className='w-full max-w-[480px] gap-5 rounded-2xl px-6 py-8 shadow-sm sm:px-8'>
        <CardHeader className='space-y-2 px-0'>
          <CardTitle className='text-2xl tracking-tight'>{title}</CardTitle>
          <CardDescription className='text-sm leading-6'>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className='px-0'>{children}</CardContent>
      </Card>
    </AuthLayout>
  )
}
