import { createFileRoute } from '@tanstack/react-router'
import { Megaphone, Plus, Calendar, Clock, Edit, Trash2 } from 'lucide-react'
import { RoseButton } from '@/components/ui/rose-button'

export const Route = createFileRoute('/_authenticated/teacher-dashboard/announcements')({
  component: AnnouncementsPage,
})

function AnnouncementsPage() {
  return (
    <div>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Announcements</h1>
          <p className='mt-2 text-gray-500'>Create and manage announcements for your classes</p>
        </div>
        <RoseButton className='rounded-xl px-6 py-3' roseVariant='gradient'>
          <Plus size={18} />
          New Announcement
        </RoseButton>
      </div>

      {/* Announcements List */}
      <div className='space-y-4'>
        {[
          {
            title: 'Midterm Exam Schedule',
            content: 'The midterm exams will be held from May 5th to May 10th. Please review the syllabus for detailed schedule and topics covered.',
            date: 'April 20, 2026',
            time: '10:00 AM',
            priority: 'high',
            groups: ['Spanish Group A', 'Spanish Group B'],
          },
          {
            title: 'Extra Office Hours',
            content: 'I will be available for additional office hours this Friday from 2 PM to 5 PM. Feel free to drop by if you need help with any topics.',
            date: 'April 18, 2026',
            time: '3:00 PM',
            priority: 'normal',
            groups: ['All Groups'],
          },
          {
            title: 'Homework Extension',
            content: 'Due to the upcoming holiday, the essay deadline has been extended to April 28th. Please make sure to submit your work on time.',
            date: 'April 15, 2026',
            time: '9:00 AM',
            priority: 'normal',
            groups: ['Spanish Group A'],
          },
        ].map((announcement, index) => (
          <div
            key={index}
            className='rounded-2xl bg-white p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)]'
          >
            <div className='flex items-start justify-between'>
              <div className='flex flex-1 gap-4'>
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                    announcement.priority === 'high' ? 'bg-[#b80035]' : 'bg-[#fff0f3]'
                  }`}
                >
                  <Megaphone size={24} className={announcement.priority === 'high' ? 'text-white' : 'text-[#b80035]'} />
                </div>
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-3'>
                    <h3 className='text-lg font-bold text-gray-800'>{announcement.title}</h3>
                    {announcement.priority === 'high' && (
                      <span className='rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600'>
                        Important
                      </span>
                    )}
                  </div>
                  <p className='text-gray-600'>{announcement.content}</p>
                  <div className='mt-4 flex flex-wrap gap-4 text-sm text-gray-500'>
                    <div className='flex items-center gap-2'>
                      <Calendar size={16} />
                      <span>{announcement.date}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Clock size={16} />
                      <span>{announcement.time}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span>Groups:</span>
                      {announcement.groups.map((group, i) => (
                        <span key={i} className='rounded-full bg-gray-100 px-2 py-1 text-xs'>
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex gap-2'>
                <button className='rounded-lg p-2 text-gray-400 hover:text-[#b80035] hover:bg-[#fff0f3]'>
                  <Edit size={18} />
                </button>
                <button className='rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50'>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
