import { useState } from 'react'
import { coursesData, type Course } from '@/data/courses-data'
import { Calendar, Plus, Users, Wallet } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { CourseModal } from '@/components/CourseModal'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export default function CoursesPage() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>(() => {
    const savedCourses = localStorage.getItem('courses')
    return savedCourses ? JSON.parse(savedCourses) : coursesData
  })
  const { addToast } = useToast()

  const [newCourse, setNewCourse] = useState<{
    title: string
    level: string
    duration: string
    groups: string
    price: string
    image: string
    color: string
    category: 'english' | 'russian' | 'other'
  }>({
    title: '',
    level: '',
    duration: '',
    groups: '',
    price: '',
    image: '',
    color: '#1e293b',
    category: 'english',
  })

  const filteredCourses = courses.filter((course) => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'english') return course.category === 'english'
    if (selectedFilter === 'russian') return course.category === 'russian'
    return true
  })

  const handleAddCourse = (course: Omit<Course, 'id'>) => {
    const newCourseData: Course = {
      title: course.title,
      level: course.level,
      duration: course.duration,
      groups: course.groups,
      price: course.price,
      image:
        course.image ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop',
      color: course.color,
      category: course.category,
      isBestseller: false,
    }

    const updatedCourses = [...courses, newCourseData]
    setCourses(updatedCourses)
    localStorage.setItem('courses', JSON.stringify(updatedCourses))

    setCourseModalOpen(false)
    setNewCourse({
      title: '',
      level: '',
      duration: '',
      groups: '',
      price: '',
      image: '',
      color: '#1e293b',
      category: 'english',
    })

    addToast(`Kurs "${course.title}" muvaffaqiyatli qo'shildi`, 'success')
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='bg-background'>
        {/* Breadcrumb & Header */}
        <div className='px-8 pt-6'>
          <p className='text-[10px] font-bold tracking-widest text-muted-foreground uppercase'>
            TA'LIM KATALOGI
          </p>
          <div className='mt-2 flex items-center justify-between'>
            <h1 className='text-3xl font-extrabold text-foreground'>
              Mavjud barcha kurslar
            </h1>
            <div className='flex gap-2 rounded-full border bg-background p-1 shadow-sm'>
              <button
                onClick={() => setSelectedFilter('all')}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                Hammasi
              </button>
              <button
                onClick={() => setSelectedFilter('english')}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  selectedFilter === 'english'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                Ingliz tili
              </button>
              <button
                onClick={() => setSelectedFilter('russian')}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  selectedFilter === 'russian'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                Rus tili
              </button>
            </div>
          </div>
        </div>

        <div className='p-8'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {filteredCourses.map((course, idx) => (
              <div key={idx} className='cursor-pointer'>
                {/* Rasm qismi */}
                <div
                  className='relative mb-4 h-48 overflow-hidden rounded-2xl shadow-sm'
                  style={{ backgroundColor: course.color }}
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className='h-full w-full object-cover opacity-60 mix-blend-overlay'
                  />
                  {course.isBestseller && (
                    <span className='absolute top-4 left-4 rounded bg-rose-600 px-2 py-1 text-[10px] font-bold text-white'>
                      BESTSELLER
                    </span>
                  )}
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <h2 className='px-4 text-center text-2xl font-black text-white drop-shadow-md'>
                      {course.title.toUpperCase()}
                    </h2>
                  </div>
                </div>

                {/* Ma'lumot qismi */}
                <div className='space-y-4'>
                  <div className='flex items-start justify-between'>
                    <h3 className='text-lg leading-tight font-bold text-foreground'>
                      {course.title}
                    </h3>
                    <span className='rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold whitespace-nowrap text-blue-600 dark:bg-blue-900 dark:text-blue-400'>
                      {course.level}
                    </span>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
                      <Calendar className='h-3.5 w-3.5 text-rose-500' />
                      Muddati: {course.duration}
                    </div>
                    <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
                      <Users className='h-3.5 w-3.5 text-rose-500' />
                      Guruhlar: {course.groups}
                    </div>
                    <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
                      <Wallet className='h-3.5 w-3.5 text-rose-500' />
                      Narxi: {course.price}
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-2'>
                    <div className='flex -space-x-2'>
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className='h-7 w-7 rounded-full border-2 border-background bg-muted'
                        />
                      ))}
                      <div className='flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-rose-100 text-[10px] font-bold text-rose-600 dark:bg-rose-900 dark:text-rose-400'>
                        +12
                      </div>
                    </div>
                    <button className='text-xs font-bold text-rose-500 dark:text-rose-400'>
                      Batafsil
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Yangi kurs qo'shish kartasi */}
            <div
              onClick={(e) => {
                e.stopPropagation()
                setCourseModalOpen(true)
              }}
              className='flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-rose-200 bg-background p-8 dark:border-rose-800'
            >
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-rose-800'>
                <Plus className='h-6 w-6' />
              </div>
              <h3 className='font-bold text-foreground'>Yangi kurs qo'shish</h3>
              <p className='mt-2 px-6 text-center text-[11px] text-muted-foreground'>
                Tizimga yangi til yoki maxsus yo'nalish kursini kiriting
              </p>
            </div>
          </div>

          {/* Pastki statistika qismi */}
          <div className='mt-12 grid grid-cols-1 gap-6 rounded-4xl border bg-card p-8 shadow-sm md:grid-cols-3'>
            <div>
              <p className='text-[10px] font-bold tracking-widest text-rose-500'>
                UMUMIY KURSLAR
              </p>
              <div className='mt-1 flex items-baseline gap-3'>
                <span className='text-4xl font-black text-foreground'>32</span>
                <span className='text-xs font-bold text-emerald-500'>
                  ↑ +4 o'tgan oydan
                </span>
              </div>
            </div>
            <div className='border-x border-border px-8'>
              <p className='text-[10px] font-bold tracking-widest text-rose-500'>
                ENG MASHHUR
              </p>
              <h4 className='mt-1 text-xl font-bold text-foreground'>
                IELTS General
              </h4>
              <p className='text-xs font-medium text-muted-foreground'>
                Ro'yxatdan o'tganlar: 245 ta
              </p>
            </div>
            <div className='pl-8'>
              <div className='mb-2 flex items-center justify-between'>
                <p className='text-[10px] font-bold tracking-widest text-rose-500'>
                  AI TAHLILI
                </p>
                <div className='h-1.5 w-24 overflow-hidden rounded-full bg-muted'>
                  <div className='h-full w-[85%] bg-rose-500' />
                </div>
              </div>
              <p className='text-[11px] leading-relaxed text-muted-foreground italic'>
                "Ingliz tili kurslariga bo'lgan talab 15% ga oshdi. Yangi
                guruhlar ochish tavsiya etiladi."
              </p>
            </div>
          </div>
        </div>
      </Main>

      {/* Course Modal */}
      <CourseModal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        onAddCourse={handleAddCourse}
        newCourse={newCourse}
        setNewCourse={setNewCourse}
      />
    </>
  )
}
