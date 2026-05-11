import { AuthCardShell } from '../auth-card-shell'
import { ForgotPasswordForm } from './components/forgot-password-form'

export function ForgotPassword() {
  return (
    <AuthCardShell
      title='Parolni tiklash'
      description='Foydalanuvchi nomi va telefon raqamingizni kiriting.'
    >
      <ForgotPasswordForm />
    </AuthCardShell>
  )
}
