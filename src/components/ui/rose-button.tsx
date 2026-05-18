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

type RoseButtonProps = Omit<React.ComponentProps<typeof Button>, 'variant'> & {
  roseVariant?: RoseButtonVariant
  roseSize?: RoseButtonSize
}

const variantClassNames: Record<RoseButtonVariant, string> = {
  solid:
    'bg-gradient-to-br from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-200 transition-all active:scale-95',
  outline:
    'bg-transparent text-rose-600 border border-rose-100 hover:bg-rose-50 rounded-xl transition-all',
  ghost: 'bg-rose-50/50 text-rose-600 hover:bg-rose-100 transition-all',
  link: 'text-rose-600 hover:text-rose-700 hover:underline p-0 h-auto transition-all',
  gradient:
    'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md shadow-rose-200 transition-all active:scale-95',
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
      className={cn(
        'font-bold tracking-tight rounded-lg border-none',
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