import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Student } from '../index'

interface EditModalProps {
  student: Student
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCancel?: () => void
}

export function EditModal({
  student,
  isOpen,
  onOpenChange,
  onCancel,
}: EditModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-lg border p-6 shadow-lg sm:max-w-lg'>
        <div className='space-y-6'>
          <div className='flex items-center space-x-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600'>
              <Edit className='h-6 w-6' />
            </div>
            <div>
              <h3 className='text-xl font-semibold text-slate-900'>
                O'quvchini tahrirlash
              </h3>
              <p className='text-sm text-slate-600'>{student.fullName}</p>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-700'>Ism</label>
              <input
                type='text'
                className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                placeholder='Ism'
                defaultValue={student.fullName.split(' ')[0]}
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-700'>
                Telefon
              </label>
              <input
                type='tel'
                className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                placeholder='+998 XX XXX XX'
                defaultValue={student.phone}
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-700'>
                Guruh
              </label>
              <select
                className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                defaultValue={student.group}
              >
                <option value='Advanced'>Advanced</option>
                <option value='Intermediate'>Intermediate</option>
                <option value='Beginner'>Beginner</option>
              </select>
            </div>
          </div>

          <div className='flex justify-end space-x-3 border-t pt-4'>
            <Button
              variant='outline'
              onClick={() => {
                onOpenChange(false)
                onCancel?.()
              }}
              className='border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            >
              BEKOR QILISH
            </Button>
            <Button className='bg-blue-600 text-white hover:bg-blue-700'>
              SAQLASH
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
