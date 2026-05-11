import { Navigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { hasAccessCode } from '@/features/auth/access'
import { SignIn } from '@/features/auth/sign-in'
import { useUserInfo, useUserToken } from '@/stores/userStore'

function LoginPage() {
  const token = useUserToken()
  const userInfo = useUserInfo()

  useEffect(() => {
    document.title = 'Login | QDTU'
  }, [])

  if (token.accessToken) {
    const isTeacher = hasAccessCode(userInfo.roles, 'ROLE_TEACHER')
    return <Navigate to={isTeacher ? '/teacher-dashboard' : '/admin-dashboard'} replace />
  }

  return <SignIn />
}
export default LoginPage;
