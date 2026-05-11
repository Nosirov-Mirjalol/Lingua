type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='flex min-h-svh items-center justify-center bg-muted/40 px-4'>
      <div className='mx-auto flex w-full max-w-[480px] flex-col items-center justify-center gap-6'>
        <div className='flex items-center justify-center text-center'>
          <h1 className='text-3xl font-bold text-[#C70C3D]'>LinguaPro</h1>
        </div>
        <div className='w-full'>{children}</div>
      </div>
    </div>
  )
}
