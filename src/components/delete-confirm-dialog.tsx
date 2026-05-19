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
      <AlertDialogContent className='max-w-[360px] rounded-2xl border-none bg-card p-6 shadow-2xl'>
        <AlertDialogHeader className='space-y-2'>
          <AlertDialogTitle className='text-center text-lg font-bold text-foreground'>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-center text-sm text-muted-foreground'>
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
            className='text-destructive-foreground h-11 w-full rounded-xl bg-gradient-to-r from-destructive to-destructive/90 font-bold shadow-lg shadow-destructive/20 transition-all active:scale-95'
          >
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              "O'chirish"
            )}
          </AlertDialogAction>
          <AlertDialogCancel className='h-11 w-full rounded-xl border-none bg-muted font-bold text-muted-foreground hover:bg-muted/80 hover:text-foreground'>
            Bekor qilish
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
