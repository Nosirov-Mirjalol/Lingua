import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  isLoading?: boolean
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "O'chirishni tasdiqlaysizmi?",
  description = "Ushbu amalni ortga qaytarib bo'lmaydi.",
  isLoading = false,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='max-w-[360px] rounded-2xl border-none bg-white p-6 shadow-2xl dark:bg-slate-900'>
        <AlertDialogHeader className='space-y-2'>
          <AlertDialogTitle className='text-center text-lg font-bold text-slate-900 dark:text-slate-100'>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-center text-sm text-slate-500 dark:text-slate-400'>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='mt-6 flex flex-col gap-2 sm:flex-col sm:space-x-0'>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className='h-11 w-full rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 font-bold text-white shadow-lg shadow-rose-200 transition-all active:scale-95 dark:shadow-none'
          >
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              "O'chirish"
            )}
          </AlertDialogAction>
          <AlertDialogCancel className='h-11 w-full rounded-xl border-none bg-slate-50 font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-300'>
            Bekor qilish
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
