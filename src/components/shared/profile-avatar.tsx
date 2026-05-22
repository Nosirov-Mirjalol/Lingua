import { useState, useMemo, useEffect, type ChangeEvent } from 'react'
import { Camera, User as UserIcon, Loader2 } from 'lucide-react'
import { getFullAvatarUrl } from '@/lib/avatar-url'
import { cn } from '@/lib/utils'

interface ProfileAvatarProps {
  avatarUrl?: string | null
  name?: string
  role?: string
  onFileSelect?: (file: File) => void
  isPending?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ProfileAvatar({
  avatarUrl,
  name,
  role,
  onFileSelect,
  isPending,
  className,
  size = 'md',
}: ProfileAvatarProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState(false)

  const previewUrl = useMemo(() => {
    if (selectedFile) return URL.createObjectURL(selectedFile)
    return getFullAvatarUrl(avatarUrl)
  }, [avatarUrl, selectedFile])

  useEffect(() => {
    if (!selectedFile || !previewUrl) return
    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl, selectedFile])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('Rasm hajmi juda katta (max 50MB)')
        return
      }
      setSelectedFile(file)
      setImageError(false)
      if (onFileSelect) {
        onFileSelect(file)
      }
    }
  }

  const sizes = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  }

  const iconSizes = {
    sm: 24,
    md: 38,
    lg: 48,
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className='group relative mb-3 shrink-0'>
        <div className={cn(
          'overflow-hidden rounded-full border-4 border-primary/10 dark:border-slate-800 transition-colors group-hover:border-primary/40 bg-white dark:bg-slate-900',
          sizes[size]
        )}>
          {previewUrl && !imageError ? (
            <img
              src={previewUrl}
              alt={name || 'Avatar'}
              onError={() => setImageError(true)}
              className='h-full w-full object-cover'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-white dark:bg-slate-900 text-muted-foreground'>
              <UserIcon size={iconSizes[size]} className='opacity-20' />
            </div>
          )}
        </div>

        {isPending && (
          <div className='absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px]'>
            <Loader2 className='animate-spin text-white' size={20} />
          </div>
        )}

        {onFileSelect && (
          <label className='absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 active:scale-95'>
            <Camera size={14} />
            <input
              type='file'
              style={{ display: 'none' }}
              accept='image/jpeg, image/png, image/webp'
              onChange={handleFileChange}
              disabled={isPending}
            />
          </label>
        )}
      </div>

      {name && (
        <h2 className={cn(
          'font-bold text-foreground text-center truncate w-full px-2',
          size === 'lg' ? 'text-lg' : 'text-sm'
        )}>
          {name}
        </h2>
      )}
      {role && (
        <span className='mt-0.5 text-[10px] font-bold uppercase tracking-wider text-primary/60 dark:text-slate-400 shrink-0'>
          {role}
        </span>
      )}
    </div>
  )
}
