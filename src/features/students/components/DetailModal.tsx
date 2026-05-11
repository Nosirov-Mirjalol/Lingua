import { Activity, CreditCard, Hash, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Student } from '../index'

export function DetailModal({
  student,
  isOpen,
  onOpenChange,
}: {
  student: Student
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg rounded-lg border p-6 shadow-lg'>
        <div className='space-y-6'>
          <div className='flex items-center space-x-4'>
            <Avatar className='h-16 w-16'>
              <AvatarImage src={student.avatar || undefined} />
              <AvatarFallback className='bg-gray-100 text-lg font-semibold text-gray-600'>
                {student.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                {student.fullName}
              </h3>
              <p className='text-sm text-gray-600'>{student.phone}</p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2 text-sm text-gray-500'>
                <User className='h-4 w-4' />
                <span>Guruh</span>
              </div>
              <p className='font-medium text-gray-900'>{student.group}</p>
            </div>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2 text-sm text-gray-500'>
                <Hash className='h-4 w-4' />
                <span>ID</span>
              </div>
              <p className='font-mono text-gray-900'>#{student.id}</p>
            </div>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2 text-sm text-gray-500'>
                <CreditCard className='h-4 w-4' />
                <span>To'lov holati</span>
              </div>
              <Badge
                className={
                  student.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : student.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }
              >
                {student.paymentStatus === 'paid' && "To'langan"}
                {student.paymentStatus === 'pending' && 'Kutilmoqda'}
                {student.paymentStatus === 'overdue' && 'Qarzdor'}
              </Badge>
            </div>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2 text-sm text-gray-500'>
                <Activity className='h-4 w-4' />
                <span>Status</span>
              </div>
              <Badge
                className={
                  student.status === 'active'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }
              >
                {student.status === 'active' ? 'Faol' : 'Faol emas'}
              </Badge>
            </div>
          </div>

          <div className='flex justify-end'>
            <Button
              onClick={() => onOpenChange(false)}
              className='hover:bg-gray-50'
            >
              Yopish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
