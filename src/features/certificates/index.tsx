import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export default function CertificatesPage() {
  return (
    <>
      <Header />
      <Main>
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Sertifikatlar ro'yxati</h2>
            <p className="text-muted-foreground">
              Bu bo'limga o'quvchilar uchun sertifikatlarni yaratish va boshqarish imkoniyatlari mavjud.
            </p>
          </div>
      </Main>
    </>
  )
}
