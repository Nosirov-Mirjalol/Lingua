import { AxiosError } from 'axios'
import { toast } from 'sonner'

const formatDetails = (data: unknown): string => {
  if (data == null) return ''
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.map(String).join(', ')
  if (typeof data === 'object') {
    const record = data as Record<string, unknown>
    return Object.entries(record)
      .map(([k, v]) => {
        if (Array.isArray(v)) return `${k}: ${v.map(String).join(', ')}`
        if (v && typeof v === 'object') return `${k}: ${JSON.stringify(v)}`
        return `${k}: ${String(v)}`
      })
      .join(' | ')
  }
  return String(data)
}

export function handleServerError(error: unknown) {
  let errMsg = 'Something went wrong!'
  let errDetails = ''

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'No content.'
  }

  if (error instanceof AxiosError) {
    const responseData = error.response?.data
    const title = (responseData as Record<string, unknown> | undefined)?.title
    const detail = (responseData as Record<string, unknown> | undefined)?.detail

    const formatted = formatDetails(responseData)
    errDetails = formatted

    if (typeof title === 'string' && title.length > 0) {
      errMsg = title
    } else if (typeof detail === 'string' && detail.length > 0) {
      errMsg = detail
    } else if (formatted) {
      errMsg = formatted
    }
  } else if (error && typeof error === 'object') {
    const asRecord = error as Record<string, unknown>
    const message = asRecord.message
    const data = asRecord.data
    const formatted = formatDetails(data)
    errDetails = formatted

    if (typeof message === 'string' && message.length > 0) {
      errMsg = formatted ? `${message} | ${formatted}` : message
    } else if (formatted) {
      errMsg = formatted
    }
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('handleServerError:', {
      errMsg,
      errDetails,
      raw: error,
    })
  }

  toast.error(errMsg)
}
