import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  X,
} from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    to: '/teacher-dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Groups',
    to: '/teacher-dashboard/groups',
    icon: Users,
  },
  {
    label: 'Attendance',
    to: '/teacher-dashboard/attendance',
    icon: ClipboardCheck,
  },
  {
    label: 'Homework',
    to: '/teacher-dashboard/homework',
    icon: BookOpen,
  },
] as const

interface TeacherSidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function TeacherSidebar({ isOpen, setIsOpen }: TeacherSidebarProps) {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  })

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className='fixed inset-0 z-[100] bg-black/50 md:hidden'
        />
      )}

      {/* Desktop Sidebar */}
      <aside className='sticky top-0 hidden h-screen w-64 flex-col gap-2 border-r border-slate-200/50 bg-slate-50 p-4 md:flex'>
        <div className='mb-4 px-4 py-6'>
          <h1 className='font-headline text-lg font-black tracking-tight text-rose-700 uppercase'>
            LinguaPro
          </h1>
          <p className='mt-1 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase'>
            Teacher Portal
          </p>
        </div>

        <nav className='flex flex-col gap-1'>
          {navItems.map((item) => {
            const isActive =
              item.to === '/teacher-dashboard'
                ? pathname === '/teacher-dashboard' ||
                  pathname === '/teacher-dashboard/'
                : pathname.startsWith(item.to)
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  isActive
                    ? 'flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-bold text-rose-600 shadow-sm transition-all duration-200 ease-in-out'
                    : 'flex items-center gap-3 px-4 py-3 text-slate-600 transition-all duration-200 ease-in-out hover:bg-rose-50 hover:text-rose-700'
                }
              >
                <Icon size={20} />
                <span className='font-headline text-sm'>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className='mt-auto rounded-2xl bg-white/50 p-4'>
          <button className='primary-gradient font-headline w-full rounded-full py-3 text-sm font-bold text-white shadow-md shadow-rose-900/20 transition-transform active:scale-95'>
            New Class Session
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-[101] flex h-screen w-64 flex-col gap-2 border-r border-slate-200/50 bg-slate-50 p-4 transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='mb-4 flex items-center justify-between px-4 py-6'>
          <div>
            <h1 className='font-headline text-lg font-black tracking-tight text-rose-700 uppercase'>
              LinguaPro
            </h1>
            <p className='mt-1 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase'>
              Teacher Portal
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className='rounded-lg p-2 hover:bg-slate-100'
          >
            <X size={20} />
          </button>
        </div>

        <nav className='flex flex-col gap-1'>
          {navItems.map((item) => {
            const isActive =
              item.to === '/teacher-dashboard'
                ? pathname === '/teacher-dashboard' ||
                  pathname === '/teacher-dashboard/'
                : pathname.startsWith(item.to)
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  isActive
                    ? 'flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-bold text-rose-600 shadow-sm transition-all duration-200 ease-in-out'
                    : 'flex items-center gap-3 px-4 py-3 text-slate-600 transition-all duration-200 ease-in-out hover:bg-rose-50 hover:text-rose-700'
                }
              >
                <Icon size={20} />
                <span className='font-headline text-sm'>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className='mt-auto rounded-2xl bg-white/50 p-4'>
          <button className='primary-gradient font-headline w-full rounded-full py-3 text-sm font-bold text-white shadow-md shadow-rose-900/20 transition-transform active:scale-95'>
            New Class Session
          </button>
        </div>
      </aside>
    </>
  )
}
