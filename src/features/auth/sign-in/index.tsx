import { useSearch } from '@tanstack/react-router'
import { AuthCardShell } from '../auth-card-shell'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthCardShell
      title='Tizimga kirish'
      description='Hisobingizga kirish uchun foydalanuvchi nomi va parolni kiriting.'
    >
      <UserAuthForm redirectTo={redirect} />
    </AuthCardShell>
  )
}
