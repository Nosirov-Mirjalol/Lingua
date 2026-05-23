import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type RoseButtonVariant =
  | 'solid'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'gradient'

type RoseButtonSize = 'sm' | 'md' | 'lg'

type RoseButtonProps = Omit<React.ComponentProps<typeof Button>, 'variant' | 'size'> & {
  roseVariant?: RoseButtonVariant
  roseSize?: RoseButtonSize
}

const variantClassNames: Record<RoseButtonVariant, string> = {
  // Umumiy silliq o'tish (transition) va bosilgandagi effekt (active) qo'shildi
  solid:
    'transition-all duration-200 active:scale-[0.98] bg-gradient-to-br from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-200/50 dark:shadow-rose-950/40 dark:from-rose-500 dark:to-rose-600 dark:hover:from-rose-600 dark:hover:to-rose-500',
  
  outline:
    'transition-all duration-200 active:scale-[0.98] bg-transparent text-rose-600 border border-rose-200 hover:bg-rose-50/50 shadow-xs dark:text-rose-400 dark:border-rose-800/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-300',
  
  ghost:
    'transition-all duration-200 active:scale-[0.98] bg-rose-50/50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300',
  
  link:
    'transition-all duration-150 bg-transparent text-rose-600 hover:text-rose-700 hover:underline p-0 h-auto shadow-none dark:text-rose-400 dark:hover:text-rose-300',
  
  gradient:
    'transition-all duration-200 active:scale-[0.98] bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md shadow-rose-200/50 dark:shadow-pink-950/30 dark:from-rose-500 dark:to-pink-600 dark:hover:from-rose-600 dark:hover:to-pink-500',
}

const sizeClassNames: Record<RoseButtonSize, string> = {
  sm: 'h-8 px-4 text-xs',
  md: 'h-10 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
}

function RoseButton({
  className,
  roseVariant = 'solid',
  roseSize = 'md',
  children,
  ...props
}: RoseButtonProps) {
  return (
    <Button
      variant={null as any}
      size={null as any}
      className={cn(
        'font-bold tracking-tight select-none transition-all duration-200 active:scale-95 border-none',
        variantClassNames[roseVariant],
        sizeClassNames[roseSize],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export { RoseButton }
export type { RoseButtonVariant, RoseButtonSize }