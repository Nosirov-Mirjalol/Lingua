import { AuthCardShell } from '../auth-card-shell'
import { ForgotPasswordForm } from './components/forgot-password-form'

export function ForgotPassword() {
  return (
    <AuthCardShell
      title='Parolni tiklash'
      description="API 1-qadam: username va phone (9 raqam). Keyin yangi parol o'rnatasiz."
    >
      <ForgotPasswordForm />
    </AuthCardShell>
  )
}
