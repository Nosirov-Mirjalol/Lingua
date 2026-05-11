import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

function MSIcon({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden='true'
      className={`material-symbols-rounded ${className ?? ''}`}
    >
      {name}
    </span>
  )
}

type SelectedAttachment =
  | { kind: 'image'; file: File; previewUrl: string }
  | { kind: 'file'; file: File }

export function MessageComposer({
  disabled,
  onSend,
}: {
  disabled: boolean
  onSend: (payload: { content: string; image?: File; attachment?: File }) => void
}) {
  const [content, setContent] = useState('')
  const [attachment, setAttachment] = useState<SelectedAttachment | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (attachment?.kind === 'image') {
        URL.revokeObjectURL(attachment.previewUrl)
      }
    }
  }, [attachment])

  const canSend = useMemo(() => {
    return !!content.trim() || !!attachment
  }, [content, attachment])

  const handlePickFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (file: File | null) => {
    if (!file) return

    if (attachment?.kind === 'image') {
      URL.revokeObjectURL(attachment.previewUrl)
    }

    if (file.type.startsWith('image/')) {
      setAttachment({ kind: 'image', file, previewUrl: URL.createObjectURL(file) })
    } else {
      setAttachment({ kind: 'file', file })
    }
  }

  const handleRemoveAttachment = () => {
    if (attachment?.kind === 'image') {
      URL.revokeObjectURL(attachment.previewUrl)
    }
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSend = () => {
    if (disabled) return
    if (!canSend) return

    const trimmed = content.trim()

    onSend({
      content: trimmed,
      image: attachment?.kind === 'image' ? attachment.file : undefined,
      attachment: attachment?.kind === 'file' ? attachment.file : undefined,
    })

    setContent('')
    handleRemoveAttachment()
  }

  return (
    <div className='border-t bg-background p-3'>
      {attachment ? (
        <div className='mb-3 flex items-center justify-between gap-3 rounded-md bg-muted p-3'>
          <div className='min-w-0'>
            {attachment.kind === 'image' ? (
              <img
                src={attachment.previewUrl}
                alt='preview'
                className='h-16 w-16 rounded-md object-cover'
              />
            ) : (
              <div className='flex items-center gap-2 text-sm text-foreground'>
                <MSIcon name='attach_file' />
                <div className='truncate'>{attachment.file.name}</div>
              </div>
            )}
          </div>

          <Button
            type='button'
            aria-label='Faylni olib tashlash'
            variant='ghost'
            size='icon'
            onClick={handleRemoveAttachment}
          >
            <MSIcon name='close' />
          </Button>
        </div>
      ) : null}

      <div className='flex items-center gap-2'>
        <Button
          type='button'
          aria-label='Fayl biriktirish'
          variant='ghost'
          size='icon'
          onClick={handlePickFile}
          disabled={disabled}
        >
          <MSIcon name='attach_file' />
        </Button>

        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='Xabar yozing...'
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSend()
            }
          }}
        />

        <Button
          type='button'
          aria-label='Yuborish'
          onClick={handleSend}
          disabled={disabled || !canSend}
          className={cn('lp-primary-bg text-white hover:opacity-90')}
        >
          <MSIcon name='send' />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        className='hidden'
        accept='image/*,*/*'
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}
