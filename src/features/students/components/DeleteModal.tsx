import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { RoseButton } from '@/components/ui/rose-button'
import type { Student } from '../index'

interface DeleteModalProps {
  student: Student
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteModal({
  student,
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md rounded-lg border p-6 shadow-lg'>
        <div className='flex flex-col items-center text-center'>
          <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600'>
            <Trash2 className='h-6 w-6' />
          </div>
          <h3 className='mb-2 text-lg font-semibold text-slate-900'>
            O'chirishni tasdiqlaysizmi?
          </h3>
          <p className='mb-6 text-sm text-slate-600'>
            <span className='font-bold text-slate-900'>{student.fullName}</span>{' '}
            ma'lumotlari butunlay o'chiriladi.
          </p>
          <div className='flex w-full gap-3'>
            <Button
              variant='outline'
              onClick={onCancel}
              className='flex-1 border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            >
              BEKOR QILISH
            </Button>
            <RoseButton
              onClick={onConfirm}
              className='flex-1'
            >
              O'CHIRISH
            </RoseButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
