import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { AuthCardShell } from '../auth-card-shell'

export function SignUp() {
  return (
    <AuthCardShell
      title="Ro'yxatdan o'tish"
      description="Hozircha self-service sign up yoqilmagan. Mavjud akkaunt bilan tizimga kiring."
    >
      <div className='space-y-4'>
        <p className='text-sm text-muted-foreground'>
          Agar sizga yangi akkaunt kerak bo'lsa, administrator bilan bog'laning.
        </p>
        <Button
          asChild
          className='w-full bg-[#C70C3D] text-white hover:bg-[#C70C3D]/90'
        >
          <Link to='/sign-in'>Tizimga kirish</Link>
        </Button>
      </div>
    </AuthCardShell>
  )
}
