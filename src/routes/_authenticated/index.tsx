import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionUserRole, getDefaultRouteForRole } from '@/lib/auth-role'

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: () => {
    const role = getSessionUserRole()
    throw redirect({
      to: getDefaultRouteForRole(role),
    })
  },
})
