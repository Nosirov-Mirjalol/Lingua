import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, getPageNumbers } from '@/lib/utils'

type ListPaginationProps = {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function ListPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
  className,
}: ListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize) || 1)
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, totalCount)
  const pageNumbers = getPageNumbers(safePage, totalPages)

  return (
    <div
      className={cn(
        'mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
        <span>
          {totalCount === 0
            ? "Ko'rsatiladigan yozuv yo'q"
            : `${start}-${end} dan ${totalCount} ta ko'rsatilmoqda`}
        </span>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-medium'>Sahifada:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className='h-8 w-[72px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          <ChevronLeft className='mr-1 h-4 w-4' />
          Oldingi
        </Button>

        <div className='hidden items-center gap-1 sm:flex'>
          {pageNumbers.map((pageNumber, index) =>
            pageNumber === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className='px-1 text-sm text-muted-foreground'
              >
                ...
              </span>
            ) : (
              <Button
                key={pageNumber}
                variant={safePage === pageNumber ? 'default' : 'outline'}
                size='sm'
                className='min-w-8'
                onClick={() => onPageChange(pageNumber as number)}
              >
                {pageNumber}
              </Button>
            )
          )}
        </div>

        <span className='text-sm text-muted-foreground sm:hidden'>
          {safePage} / {totalPages}
        </span>

        <Button
          variant='outline'
          size='sm'
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          Keyingi
          <ChevronRight className='ml-1 h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}