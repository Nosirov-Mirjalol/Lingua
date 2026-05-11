import type { ReactNode } from 'react'
import { useAuthCheck } from './use-auth'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  check?: string
  checkAny?: string[]
  checkAll?: string[]
  baseOn?: 'role' | 'permission'
}

export function AuthGuard({
  children,
  fallback = null,
  check,
  checkAny,
  checkAll,
  baseOn = 'permission',
}: AuthGuardProps) {
  const auth = useAuthCheck(baseOn)

  let hasAccess = true

  if (check) {
    hasAccess = auth.check(check)
  } else if (checkAny?.length) {
    hasAccess = auth.checkAny(checkAny)
  } else if (checkAll?.length) {
    hasAccess = auth.checkAll(checkAll)
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

export default AuthGuard
