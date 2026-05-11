import { useMemo, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type AddResultModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: AddResultPayload) => void
}

type ScoreKey = 'reading' | 'listening' | 'writing' | 'speaking'

export type AddResultPayload = {
  name: string
  photoFile: File | null
  scores: Record<ScoreKey, number>
  overall: number
}

type ScoreErrors = Partial<Record<ScoreKey, string>>

const ACCENT = '#E8294C'

function sanitizeBandInput(value: string) {
  const only = value.replace(/[^0-9.]/g, '')
  const capped = only.slice(0, 3)
  const firstDot = capped.indexOf('.')
  if (firstDot === -1) return only
  const before = capped.slice(0, firstDot + 1)
  const after = capped.slice(firstDot + 1).replace(/\./g, '')
  return `${before}${after}`
}

function normalizeBandOnBlur(value: string) {
  if (!value.trim()) return ''
  const num = Number(value)
  if (!Number.isFinite(num)) return ''
  const clamped = Math.min(9, Math.max(0, num))
  const rounded = Math.round(clamped * 2) / 2
  return rounded.toFixed(1)
}

function validateBand(value: string) {
  if (!value.trim()) return 'Band kiriting'
  if (!/^\d(\.\d)?$/.test(value) && value !== '9')
    return '0.0 - 9.0 (0.5 qadam)'
  const num = Number(value)
  if (!Number.isFinite(num)) return "Noto'g'ri qiymat"
  if (num < 0 || num > 9) return "0.0 - 9.0 oralig'ida"
  if (Math.round(num * 2) !== num * 2) return 'Faqat 0.5 qadam'
  return null
}

function parseBand(value: string) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return num
}

export function AddResultModal({
  open,
  onOpenChange,
  onSave,
}: AddResultModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  const [scores, setScores] = useState<Record<ScoreKey, string>>({
    reading: '',
    listening: '',
    writing: '',
    speaking: '',
  })
  const [scoreErrors, setScoreErrors] = useState<ScoreErrors>({})

  const overall = useMemo(() => {
    const keys = Object.keys(scores) as ScoreKey[]
    const values = keys.map((k) => {
      const err = validateBand(scores[k])
      return err ? 0 : parseBand(scores[k])
    })

    const avg = values.reduce((a, b) => a + b, 0) / 4
    const rounded = Math.round(avg * 2) / 2
    return Number.isFinite(rounded) ? rounded : 0
  }, [scores])

  const setScore = (key: ScoreKey, value: string) => {
    const next = sanitizeBandInput(value)
    setScores((s) => ({ ...s, [key]: next }))
    setScoreErrors((e) => ({ ...e, [key]: undefined }))
  }

  const finalizeScore = (key: ScoreKey) => {
    setScores((s) => {
      const normalized = normalizeBandOnBlur(s[key])
      return { ...s, [key]: normalized }
    })
    setScoreErrors((e) => {
      const err = validateBand(scores[key])
      return { ...e, [key]: err ?? undefined }
    })
  }

  const validateAll = () => {
    let ok = true

    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('Ism-familiya majburiy')
      ok = false
    } else {
      setNameError(null)
    }

    const nextErrors: ScoreErrors = {}
    ;(Object.keys(scores) as ScoreKey[]).forEach((key) => {
      const err = validateBand(scores[key])
      if (err) {
        nextErrors[key] = err
        ok = false
      }
    })
    setScoreErrors(nextErrors)

    return ok
  }

  const reset = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setName('')
    setNameError(null)
    setScores({ reading: '', listening: '', writing: '', speaking: '' })
    setScoreErrors({})
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!validateAll()) return

    const payload: AddResultPayload = {
      name: name.trim(),
      photoFile,
      scores: {
        reading: parseBand(scores.reading),
        listening: parseBand(scores.listening),
        writing: parseBand(scores.writing),
        speaking: parseBand(scores.speaking),
      },
      overall,
    }

    onSave(payload)
    handleClose()
    reset()
  }

  const handlePickImage = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (file: File | null) => {
    setPhotoFile(file)
    if (!file) {
      setPhotoPreview(null)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPhotoPreview(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.readAsDataURL(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-w-[420px] gap-0 overflow-hidden rounded-[28px] border-0 bg-white p-0 shadow-[0_30px_90px_-50px_rgba(2,6,23,0.45)]'
      >
        <div className='flex items-start justify-between px-10 pt-8'>
          <DialogHeader className='gap-1'>
            <DialogTitle className='text-xl font-extrabold text-slate-900'>
              Yangi Natija Qo'shish
            </DialogTitle>
          </DialogHeader>

          <DialogClose asChild>
            <button
              type='button'
              onClick={handleClose}
              className='grid h-10 w-10 place-items-center rounded-full bg-white text-slate-700 hover:bg-slate-100'
            >
              <X size={18} />
            </button>
          </DialogClose>
        </div>

        <div className='px-10 pt-7 pb-8'>
          <div className='grid gap-5'>
            <div className='grid place-items-center'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  handleImageChange(file)
                }}
              />
              <button
                type='button'
                onClick={handlePickImage}
                className='grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-dashed border-rose-200 bg-rose-50 text-rose-700'
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt='Preview'
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <Camera size={18} />
                )}
              </button>
              <p className='mt-3 text-[11px] font-extrabold tracking-[0.14em] text-rose-700'>
                PROFIL RASMI
              </p>
            </div>

            <div>
              <p className='text-[11px] font-extrabold tracking-[0.14em] text-slate-400'>
                O\'QUVCHI ISM FAMILIYASI
              </p>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameError(null)
                }}
                placeholder='Masalan: Azizbek Temirov'
                className={
                  nameError
                    ? `mt-2 h-12 rounded-full border border-[${ACCENT}] bg-slate-100 px-5 text-sm shadow-none focus:border-[${ACCENT}] focus:ring-2 focus:ring-[${ACCENT}]/25`
                    : 'mt-2 h-12 rounded-full border-0 bg-slate-100 px-5 text-sm shadow-none'
                }
              />
              {nameError && (
                <p className='mt-1 text-xs font-semibold text-rose-600'>
                  {nameError}
                </p>
              )}
            </div>

            <div>
              <p className='text-[11px] font-extrabold tracking-[0.14em] text-slate-400'>
                IELTS KO\'NIKMALARI
              </p>

              <div className='mt-2 grid grid-cols-2 gap-3'>
                <div className='flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3'>
                  <span className='text-sm font-semibold text-slate-700'>
                    Reading
                  </span>
                  <Input
                    value={scores.reading}
                    onChange={(e) => setScore('reading', e.target.value)}
                    onBlur={() => finalizeScore('reading')}
                    inputMode='decimal'
                    maxLength={3}
                    placeholder='0.0'
                    className={
                      scoreErrors.reading
                        ? `h-8 w-16 rounded-full border border-[${ACCENT}] bg-white px-3 text-right text-sm shadow-none focus:border-[${ACCENT}] focus:ring-2 focus:ring-[${ACCENT}]/25`
                        : 'h-8 w-16 rounded-full border-0 bg-white px-3 text-right text-sm shadow-none'
                    }
                  />
                </div>
                <div className='flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3'>
                  <span className='text-sm font-semibold text-slate-700'>
                    Listening
                  </span>
                  <Input
                    value={scores.listening}
                    onChange={(e) => setScore('listening', e.target.value)}
                    onBlur={() => finalizeScore('listening')}
                    inputMode='decimal'
                    maxLength={3}
                    placeholder='0.0'
                    className={
                      scoreErrors.listening
                        ? `h-8 w-16 rounded-full border border-[${ACCENT}] bg-white px-3 text-right text-sm shadow-none focus:border-[${ACCENT}] focus:ring-2 focus:ring-[${ACCENT}]/25`
                        : 'h-8 w-16 rounded-full border-0 bg-white px-3 text-right text-sm shadow-none'
                    }
                  />
                </div>
                <div className='flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3'>
                  <span className='text-sm font-semibold text-slate-700'>
                    Writing
                  </span>
                  <Input
                    value={scores.writing}
                    onChange={(e) => setScore('writing', e.target.value)}
                    onBlur={() => finalizeScore('writing')}
                    inputMode='decimal'
                    maxLength={3}
                    placeholder='0.0'
                    className={
                      scoreErrors.writing
                        ? `h-8 w-16 rounded-full border border-[${ACCENT}] bg-white px-3 text-right text-sm shadow-none focus:border-[${ACCENT}] focus:ring-2 focus:ring-[${ACCENT}]/25`
                        : 'h-8 w-16 rounded-full border-0 bg-white px-3 text-right text-sm shadow-none'
                    }
                  />
                </div>
                <div className='flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3'>
                  <span className='text-sm font-semibold text-slate-700'>
                    Speaking
                  </span>
                  <Input
                    value={scores.speaking}
                    onChange={(e) => setScore('speaking', e.target.value)}
                    onBlur={() => finalizeScore('speaking')}
                    inputMode='decimal'
                    maxLength={3}
                    placeholder='0.0'
                    className={
                      scoreErrors.speaking
                        ? `h-8 w-16 rounded-full border border-[${ACCENT}] bg-white px-3 text-right text-sm shadow-none focus:border-[${ACCENT}] focus:ring-2 focus:ring-[${ACCENT}]/25`
                        : 'h-8 w-16 rounded-full border-0 bg-white px-3 text-right text-sm shadow-none'
                    }
                  />
                </div>
              </div>

              {(scoreErrors.reading ||
                scoreErrors.listening ||
                scoreErrors.writing ||
                scoreErrors.speaking) && (
                <div className='mt-2 grid gap-1'>
                  {(Object.keys(scoreErrors) as ScoreKey[]).map((k) => {
                    const msg = scoreErrors[k]
                    if (!msg) return null
                    return (
                      <p
                        key={k}
                        className='text-xs font-semibold text-rose-600'
                      >
                        {k.charAt(0).toUpperCase() + k.slice(1)}: {msg}
                      </p>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <p className='text-[11px] font-extrabold tracking-[0.14em] text-slate-400'>
                UMUMIY BALL
              </p>
              <div className='mt-2 flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3'>
                <span className='text-sm font-semibold text-slate-700'>
                  Overall Band
                </span>
                <Input
                  readOnly
                  value={overall.toFixed(1)}
                  className='h-8 w-16 rounded-full border-0 bg-white px-3 text-right text-sm font-extrabold text-slate-700 shadow-none'
                />
              </div>
            </div>

            <div className='mt-4 grid grid-cols-2 gap-3'>
              <DialogClose asChild>
                <button
                  type='button'
                  onClick={() => {
                    handleClose()
                    reset()
                  }}
                  className='h-11 rounded-full bg-transparent text-sm font-bold text-slate-600 hover:bg-slate-50'
                >
                  Bekor qilish
                </button>
              </DialogClose>
              <button
                type='button'
                onClick={handleSubmit}
                className='primary-gradient h-11 rounded-full text-sm font-bold text-white shadow-lg shadow-rose-900/15'
              >
                Natijani Saqlash
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
