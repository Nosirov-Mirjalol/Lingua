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
  solid:
    'bg-gradient-to-br from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-200 dark:shadow-none',
  outline:
    'bg-transparent text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 shadow-xs dark:shadow-none',
  ghost:
    'bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/30',
  link:
    'bg-transparent hover:bg-transparent border-none text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline p-0 h-auto shadow-none',
  gradient:
    'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md shadow-rose-200 dark:shadow-none',
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
        'font-bold tracking-tight rounded-lg select-none transition-all duration-200 active:scale-95 border-none',
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