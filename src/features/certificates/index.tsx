import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export default function CertificatesPage() {
  return (
    <>
      <Header>
        <h1 className='text-lg font-semibold'>Sertifikatlar</h1>
      </Header>
      <Main className='bg-background'>
        <div className='rounded-lg border p-4'>
          <h2 className='mb-4 text-lg font-semibold'>Sertifikatlar ro'yxati</h2>
          <p className='text-muted-foreground'>
            Bu bo'limga o'quvchilar uchun sertifikatlarni yaratish va boshqarish
            imkoniyatlari mavjud.
          </p>
        </div>
      </Main>
    </>
  )
}
