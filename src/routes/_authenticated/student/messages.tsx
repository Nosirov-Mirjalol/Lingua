import { createFileRoute } from '@tanstack/react-router'
import { StudentChat } from '@/features/students/components/student-chat'

export const Route = createFileRoute('/_authenticated/student/messages')({
  component: StudentMessagesPage,
})

function StudentMessagesPage() {
  return (
    <div className='flex flex-col gap-4 h-full'>
      <div className='flex flex-col gap-1'>
        <p className='text-xs font-bold uppercase tracking-widest text-rose-600'>Messages</p>
        <h1 className='text-2xl font-bold text-slate-900'>Teacher Support</h1>
      </div>
      
      <StudentChat />
    </div>
  )
}
