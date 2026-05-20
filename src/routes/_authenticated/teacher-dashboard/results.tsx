import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  PencilLine,
  Plus,
} from 'lucide-react'
import { RoseButton } from '@/components/ui/rose-button'
import { AddResultModal } from '@/components/teacher/modals/AddResultModal'
import { ListPagination } from '@/components/list-pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute(
  '/_authenticated/teacher-dashboard/results'
)({
  component: ResultsPage,
})

function ResultsPage() {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingResult, setEditingResult] = useState<any>(null)
  const [editScore, setEditScore] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  return (
    <div>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>Results</h1>
          <p className='mt-2 text-gray-500 dark:text-gray-400'>
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
          <button className='flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-slate-800'>
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
        <div className='rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)] dark:shadow-none border border-transparent dark:border-slate-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-[#fff0f3] dark:bg-rose-950/50 p-3 text-[#b80035] dark:text-rose-400'>
              <BarChart3 size={24} />
            </div>
            <span className='flex items-center gap-1 text-sm font-semibold text-green-600'>
              <TrendingUp size={14} />
              +5%
            </span>
          </div>
          <p className='text-3xl font-bold text-gray-800 dark:text-white'>87%</p>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Average Score</p>
        </div>
        <div className='rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)] dark:shadow-none border border-transparent dark:border-slate-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-green-100 dark:bg-emerald-950/50 p-3 text-green-600 dark:text-emerald-400'>
              <TrendingUp size={24} />
            </div>
            <span className='flex items-center gap-1 text-sm font-semibold text-green-600'>
              <TrendingUp size={14} />
              +12%
            </span>
          </div>
          <p className='text-3xl font-bold text-gray-800 dark:text-white'>92%</p>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Pass Rate</p>
        </div>
        <div className='rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)] dark:shadow-none border border-transparent dark:border-slate-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-yellow-100 dark:bg-yellow-950/50 p-3 text-yellow-600 dark:text-yellow-400'>
              <TrendingDown size={24} />
            </div>
            <span className='flex items-center gap-1 text-sm font-semibold text-red-600'>
              <TrendingDown size={14} />
              -3%
            </span>
          </div>
          <p className='text-3xl font-bold text-gray-800 dark:text-white'>78%</p>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Completion Rate</p>
        </div>
        <div className='rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)] dark:shadow-none border border-transparent dark:border-slate-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-blue-100 dark:bg-blue-950/50 p-3 text-blue-600 dark:text-blue-400'>
              <BarChart3 size={24} />
            </div>
            <span className='flex items-center gap-1 text-sm font-semibold text-green-600'>
              <TrendingUp size={14} />
              +8%
            </span>
          </div>
          <p className='text-3xl font-bold text-gray-800 dark:text-white'>156</p>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Total Assessments</p>
        </div>
      </div>

      {/* Results Table */}
      <div className='rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-[0_20px_40px_-10px_rgba(25,28,30,0.06)] dark:shadow-none border border-transparent dark:border-slate-800'>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-lg font-bold text-gray-800 dark:text-white'>Recent Results</h2>
          <button className='text-sm font-semibold text-[#b80035] dark:text-rose-400 hover:underline'>
            View All
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-200 dark:border-slate-800'>
              <th className='pb-4 text-left text-sm font-semibold text-gray-600 dark:text-slate-400'>
                Student
              </th>
              <th className='pb-4 text-left text-sm font-semibold text-gray-600 dark:text-slate-400'>
                Assessment
              </th>
              <th className='pb-4 text-left text-sm font-semibold text-gray-600 dark:text-slate-400'>
                Score
              </th>
              <th className='pb-4 text-left text-sm font-semibold text-gray-600 dark:text-slate-400'>
                Date
              </th>
              <th className='pb-4 text-left text-sm font-semibold text-gray-600 dark:text-slate-400'>
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
                className='border-b border-gray-100 dark:border-slate-800 last:border-0'
              >
                <td className='py-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white'>
                      {result.name}
                    </div>
                    <span className='font-medium text-gray-800 dark:text-white'>
                      {result.name}
                    </span>
                  </div>
                </td>
                <td className='py-4 text-sm text-gray-600 dark:text-slate-400'>
                  {result.assessment}
                </td>
                <td className='py-4 text-sm font-semibold text-gray-800 dark:text-white'>
                  {result.score}
                </td>
                <td className='py-4 text-sm text-gray-600 dark:text-slate-400'>{result.date}</td>
                <td className='py-4'>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      result.status === 'excellent'
                        ? 'bg-green-100 dark:bg-emerald-950/50 text-green-700 dark:text-emerald-400'
                        : result.status === 'good'
                          ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400'
                          : 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400'
                    }`}
                  >
                    {result.status.charAt(0).toUpperCase() +
                      result.status.slice(1)}
                  </span>
                </td>
                <td className='py-4'>
                  <button
                    onClick={() => {
                      setEditingResult(result)
                      setEditScore(result.score)
                      setEditOpen(true)
                    }}
                    className='flex items-center gap-1 text-sm font-semibold text-[#b80035] hover:underline dark:text-rose-400'
                  >
                    <PencilLine size={14} />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <ListPagination
        page={page}
        pageSize={pageSize}
        totalCount={4}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />

      {/* Edit Result Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className='max-w-md rounded-2xl border-none bg-white p-6 shadow-[0_30px_60px_-15px_rgba(25,28,30,0.20)] dark:bg-slate-900 dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold text-gray-800 dark:text-white'>
              Edit Result
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4 pt-4'>
            <div>
              <Label htmlFor='score'>Score</Label>
              <Input
                id='score'
                value={editScore}
                onChange={(e) => setEditScore(e.target.value)}
                placeholder='Enter score (e.g., 95%)'
                className='mt-1'
              />
            </div>
            <div className='flex justify-end gap-3 pt-4'>
              <RoseButton
                roseVariant='outline'
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </RoseButton>
              <RoseButton
                roseVariant='solid'
                onClick={() => {
                  // Update logic here
                  setEditOpen(false)
                }}
              >
                Save
              </RoseButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
