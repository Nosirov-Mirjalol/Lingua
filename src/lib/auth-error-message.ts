import type { ApiError } from '@/api/client'

const MESSAGE_MAP: Array<{ match: RegExp; text: string }> = [
  {
    match: /CustomUser matching query does not exist/i,
    text: "Username yoki telefon noto'g'ri. Login qiladigan nom va profildagi telefonni kiriting.",
  },
  {
    match: /username ega foydalanuvchi mavjud emas/i,
    text: "Bunday username topilmadi. Tizimga kirishda ishlatadigan nomingizni kiriting.",
  },
  {
    match: /mavjud emas/i,
    text: "Foydalanuvchi topilmadi yoki ma'lumotlar noto'g'ri.",
  },
  {
    match: /telefon|phone/i,
    text: "Telefon raqami profildagi raqam bilan mos kelmayapti (9 raqam, masalan 883483434).",
  },
  {
    match: /parol.*mos|password.*match|confirm/i,
    text: "Yangi parollar bir xil emas yoki talablarga javob bermaydi.",
  },
]

function pickFriendlyMessage(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  for (const { match, text } of MESSAGE_MAP) {
    if (match.test(trimmed)) return text
  }
  return null
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as Partial<ApiError>
    const status = Number(apiError.status)

    if (status === 500) {
      return "Server vaqtincha javob bermayapti. Birozdan keyin qayta urinib ko'ring."
    }
    if (status === 0) {
      return "Tarmoq xatosi — serverga ulanib bo'lmadi."
    }

    const raw = String(apiError.message ?? '').trim()
    const friendly = pickFriendlyMessage(raw)
    if (friendly) return friendly
    if (raw && raw.length < 200 && !raw.includes('ErrorDetail')) return raw
  }

  if (error instanceof Error && error.message.trim()) {
    const friendly = pickFriendlyMessage(error.message)
    if (friendly) return friendly
    return error.message.trim()
  }

  return fallback
}
