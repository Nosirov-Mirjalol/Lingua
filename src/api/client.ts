import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { toast } from 'sonner'
import useUserStore from '@/stores/userStore'

export interface ApiError {
  message: string
  status: number
  success: boolean
  data?: unknown
}

const PUBLIC_AUTH_PATHS = [
  '/api/auth/login/',
  '/api/auth/forgot-password/',
  '/api/auth/verfiy-password/',
]

function shouldAttachAuthHeader(url?: string): boolean {
  if (!url) return true
  return !PUBLIC_AUTH_PATHS.some((path) => url.includes(path))
}

function getStoredAccessToken() {
  const fromStore = useUserStore.getState().userToken?.accessToken
  if (fromStore) return fromStore

  if (typeof window === 'undefined') return ''

  const fromSession = sessionStorage.getItem('linguapro_access_token') ?? ''
  if (fromSession) return fromSession

  const fromLocal = localStorage.getItem('access_token') ?? ''
  return fromLocal
}
function formatDrfErrorDetail(data: unknown): string | null {
  if (data == null) return null
  if (typeof data === 'string') {
    const s = data.trim()
    return s.length ? s : null
  }
  if (typeof data !== 'object') return null

  const o = data as Record<string, unknown>
  const parts: string[] = []
  const pushDetail = (v: unknown) => {
    if (typeof v === 'string' && v.trim()) parts.push(v.trim())
    else if (Array.isArray(v))
      parts.push(...v.map(String).filter((s) => s && s.trim()))
    else if (v && typeof v === 'object') parts.push(JSON.stringify(v))
  }

  if ('detail' in o) pushDetail(o.detail)
  if ('non_field_errors' in o) pushDetail(o.non_field_errors)

  for (const [key, val] of Object.entries(o)) {
    if (key === 'detail' || key === 'non_field_errors' || key === 'message')
      continue
    if (Array.isArray(val)) {
      const joined = val.map(String).filter(Boolean).join('; ')
      if (joined) parts.push(`${key}: ${joined}`)
    } else if (typeof val === 'string' && val.trim()) {
      parts.push(`${key}: ${val.trim()}`)
    }
  }

  const msgField =
    typeof o.message === 'string' && o.message.trim() ? o.message.trim() : ''
  if (msgField && !parts.some((p) => p.includes(msgField)))
    parts.unshift(msgField)

  const out = parts.filter(Boolean).join(' · ')
  return out.length ? out : null
}

class ApiClient {
  private client: AxiosInstance
  constructor() {
    const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()
    const baseURL = envBaseUrl || ''

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        if (!shouldAttachAuthHeader(config.url)) {
          if (config.headers) {
            delete (config.headers as Record<string, unknown>).Authorization
            delete (config.headers as Record<string, unknown>).authorization
          }
          return config
        }
        const token = getStoredAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: unknown) => {
        return Promise.reject(error)
      }
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          const { status, data } = error.response

          const responseData: unknown = data

          const derivedMessage = (() => {
            if (typeof responseData === 'string') return responseData
            if (responseData && typeof responseData === 'object') {
              const drf = formatDrfErrorDetail(responseData)
              if (drf) return drf
              const asRecord = responseData as Record<string, unknown>
              return (
                asRecord?.message ??
                asRecord?.detail ??
                error.message ??
                'Server xatosi'
              )
            }
            return error.message ?? 'Server xatosi'
          })()

          const apiError: ApiError = {
            message: String(derivedMessage),
            status,
            success: false,
            data: responseData,
          }
          if (status === 401) {
            useUserStore.getState().actions.clearUserInfoAndToken()
            window.location.href = '/sign-in'
          }

          const msg = String(
            (data as unknown as Record<string, unknown> | undefined)?.message ??
              ''
          )
          const isStaticResourceNoise = msg.includes('No static resource')
          if (status === 500 && !isStaticResourceNoise) {
            toast.error(
              "Server vaqtincha ishlamayapti, qaytadan urinib ko'ring"
            )
          }
          if (status === 404) {
            const base = (this.client.defaults.baseURL ?? '').toString()
            const hint =
              base.length === 0
                ? 'API manzili sozlanmagan (VITE_API_BASE_URL).'
                : `API manzili: ${base}`
            toast.error(`Endpoint topilmadi. ${hint}`)
          }

          return Promise.reject(apiError)
        }
        return Promise.reject({
          message: "Tarmoq xatosi — serverga ulanib bo'lmadi",
          status: 0,
          success: false,
        } satisfies ApiError)
      }
    )
  }
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config)

    return response.data
  }
  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const requestConfig = { ...(config ?? {}) }
    if (data instanceof FormData) {
      requestConfig.headers = {
        ...(config?.headers as Record<string, unknown> | undefined),
        'Content-Type': undefined,
      }
    }
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      requestConfig
    )
    return response.data
  }
  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const requestConfig = { ...(config ?? {}) }
    if (data instanceof FormData) {
      requestConfig.headers = {
        ...(config?.headers as Record<string, unknown> | undefined),
        'Content-Type': undefined,
      }
    }
    const response: AxiosResponse<T> = await this.client.put(
      url,
      data,
      requestConfig
    )
    return response.data
  }
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const requestConfig = { ...(config ?? {}) }
    if (data instanceof FormData) {
      requestConfig.headers = {
        ...(config?.headers as Record<string, unknown> | undefined),
        'Content-Type': undefined,
      }
    }
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      requestConfig
    )
    return response.data
  }
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
export default apiClient
