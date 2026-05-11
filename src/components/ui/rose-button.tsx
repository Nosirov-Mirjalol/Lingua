import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type RoseButtonVariant =
  | 'solid'
  | 'pill'
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
    'bg-[#b80035] hover:bg-[#a8002e] text-white shadow-sm transition-colors',
  pill: 'bg-[#d0083a] hover:bg-[#b0062f] text-white rounded-full shadow-[0_2px_8px_rgba(208,8,58,0.28)] transition-colors',
  outline:
    'bg-transparent text-[#b80035] border border-[#b80035] hover:bg-[#b80035]/10 rounded-full transition-colors',
  ghost: 'bg-[#fff0f3] text-[#b80035] hover:bg-[#ffe5eb] transition-colors',
  link: 'text-[#b80035] hover:text-[#a8002e] hover:underline p-0 h-auto transition-colors',
  gradient:
    'primary-gradient text-white shadow-md shadow-rose-900/20 transition-transform active:scale-95',
}

const sizeClassNames: Record<RoseButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
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
        'font-semibold tracking-tight',
        roseVariant !== 'link' && 'rounded-xl',
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
