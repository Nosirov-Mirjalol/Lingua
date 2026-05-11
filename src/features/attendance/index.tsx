import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export default function AttendancePage() {
  return (
    <>
      <Header>
        <h1 className="text-lg font-semibold">Davomat</h1>
      </Header>
      <Main>
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Davomat ro'yxati</h2>
            <p className="text-muted-foreground">
              Bu bo'limga o'quvchilar davomatini qilish va boshqarish imkoniyatlari mavjud.
            </p>
          </div>
      </Main>
    </>
  )
}
