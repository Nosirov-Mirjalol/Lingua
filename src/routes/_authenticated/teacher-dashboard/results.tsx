import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
} from 'lucide-react'
import { RoseButton } from '@/components/ui/rose-button'
import { AddResultModal } from '@/components/teacher/modals/AddResultModal'

export const Route = createFileRoute(
  '/_authenticated/teacher-dashboard/results'
)({
  component: ResultsPage,
})

function ResultsPage() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Results</h1>
          <p className='mt-2 text-gray-500'>
            View and analyze student performance
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <RoseButton
            onClick={() => setOpen(true)}
            className='flex items-center gap-2'
          >
            <Plus size={18} />
            Add Result
          </RoseButton>
          <button className='flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50'>
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      <AddResultModal
        open={open}
        onOpenChange={setOpen}
        onSave={() => {
          setOpen(false)
        }}
      />

      {/* Stats Cards */}
      <div className='mb-8 grid grid-cols-4 gap-4'>
        <div className='rounded-2xl bg-white p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)]'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-[#fff0f3] p-3 text-[#b80035]'>
              <BarChart3 size={24} />
            </div>
            <span className='flex items-center gap-1 text-sm font-semibold text-green-600'>
              <TrendingUp size={14} />
              +5%
            </span>
          </div>
          <p className='text-3xl font-bold text-gray-800'>87%</p>
          <p className='text-sm text-gray-500'>Average Score</p>
        </div>
        <div className='rounded-2xl bg-white p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)]'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-green-100 p-3 text-green-600'>
              <TrendingUp size={24} />
            </div>
            <span className='flex items-center gap-1 text-sm font-semibold text-green-600'>
              <TrendingUp size={14} />
              +12%
            </span>
          </div>
          <p className='text-3xl font-bold text-gray-800'>92%</p>
          <p className='text-sm text-gray-500'>Pass Rate</p>
        </div>
        <div className='rounded-2xl bg-white p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)]'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-yellow-100 p-3 text-yellow-600'>
              <TrendingDown size={24} />
            </div>
            <span className='flex items-center gap-1 text-sm font-semibold text-red-600'>
              <TrendingDown size={14} />
              -3%
            </span>
          </div>
          <p className='text-3xl font-bold text-gray-800'>78%</p>
          <p className='text-sm text-gray-500'>Completion Rate</p>
        </div>
        <div className='rounded-2xl bg-white p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)]'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-blue-100 p-3 text-blue-600'>
              <BarChart3 size={24} />
            </div>
            <span className='flex items-center gap-1 text-sm font-semibold text-green-600'>
              <TrendingUp size={14} />
              +8%
            </span>
          </div>
          <p className='text-3xl font-bold text-gray-800'>156</p>
          <p className='text-sm text-gray-500'>Total Assessments</p>
        </div>
      </div>

      {/* Results Table */}
      <div className='rounded-2xl bg-white p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)]'>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-lg font-bold text-gray-800'>Recent Results</h2>
          <button className='text-sm font-semibold text-[#b80035] hover:underline'>
            View All
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-200'>
              <th className='pb-4 text-left text-sm font-semibold text-gray-600'>
                Student
              </th>
              <th className='pb-4 text-left text-sm font-semibold text-gray-600'>
                Assessment
              </th>
              <th className='pb-4 text-left text-sm font-semibold text-gray-600'>
                Score
              </th>
              <th className='pb-4 text-left text-sm font-semibold text-gray-600'>
                Date
              </th>
              <th className='pb-4 text-left text-sm font-semibold text-gray-600'>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                name: 'Marc Lawson',
                assessment: 'Unit 5 Quiz',
                score: '95%',
                date: 'Apr 20, 2026',
                status: 'excellent',
              },
              {
                name: 'Sarah Kim',
                assessment: 'Essay Writing',
                score: '88%',
                date: 'Apr 19, 2026',
                status: 'good',
              },
              {
                name: 'Javier Delgado',
                assessment: 'Vocabulary Test',
                score: '72%',
                date: 'Apr 18, 2026',
                status: 'needs improvement',
              },
              {
                name: 'Emily Chen',
                assessment: 'Unit 5 Quiz',
                score: '91%',
                date: 'Apr 20, 2026',
                status: 'excellent',
              },
            ].map((result, index) => (
              <tr
                key={index}
                className='border-b border-gray-100 last:border-0'
              >
                <td className='py-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white'>
                      {result.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <span className='font-medium text-gray-800'>
                      {result.name}
                    </span>
                  </div>
                </td>
                <td className='py-4 text-sm text-gray-600'>
                  {result.assessment}
                </td>
                <td className='py-4 text-sm font-semibold text-gray-800'>
                  {result.score}
                </td>
                <td className='py-4 text-sm text-gray-600'>{result.date}</td>
                <td className='py-4'>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      result.status === 'excellent'
                        ? 'bg-green-100 text-green-700'
                        : result.status === 'good'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {result.status.charAt(0).toUpperCase() +
                      result.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
