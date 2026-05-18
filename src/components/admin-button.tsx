import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  loading?: boolean
}

export function AdminButton({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  loading = false,
}: AdminButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground hover:bg-primary/90 font-bold'
      case 'secondary':
        return 'bg-muted text-foreground hover:bg-muted/80 font-medium'
      case 'danger':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold'
      case 'outline':
        return 'border text-foreground hover:bg-muted font-medium'
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90 font-bold'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-9 px-3 text-sm rounded-xl'
      case 'md':
        return 'h-10 px-4 text-sm rounded-xl'
      case 'lg':
        return 'h-11 px-6 text-base rounded-xl'
      default:
        return 'h-10 px-4 text-sm rounded-xl'
    }
  }

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      {loading ? (
        <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
      ) : Icon ? (
        <Icon className='mr-2 h-4 w-4' />
      ) : null}
      {children}
    </Button>
  )
}
