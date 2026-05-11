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

/** Django REST Framework 400: { "field": ["msg"], "detail": "..." } */
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
    const envBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
    const fallbackDevBaseUrl = import.meta.env.DEV
      ? 'http://localhost:8000'
      : ''

    this.client = axios.create({
      baseURL: envBaseUrl || fallbackDevBaseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // har bir apiga so'rov ketishidan oldin ishlaydigan function
    this.client.interceptors.request.use(
      (config) => {
        const token = useUserStore.getState().userToken?.accessToken

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: unknown) => {
        return Promise.reject(error)
      }
    )
    // Reponse interceptors

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        // Server javob qaytargan bo'lsa
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

          // 401 — token eskirgan yoki noto'g'ri
          if (status === 401) {
            useUserStore.getState().actions.clearUserInfoAndToken()
            window.location.href = '/sign-in'
          }

          const msg = String(
            (data as unknown as Record<string, unknown> | undefined)?.message ??
              ''
          )
          const isStaticResourceNoise = msg.includes('No static resource')

          // 500 — server ichki xatosi (noto'g'ri URL / static handler — toast chiqarmaymiz)
          if (status === 500 && !isStaticResourceNoise) {
            toast.error(
              "Server vaqtincha ishlamayapti, qaytadan urinib ko'ring"
            )
          }

          // 404 — endpoint topilmadi (ko'pincha baseURL/proxy noto'g'ri)
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

        // Server javob bermagan — tarmoq xatosi
        return Promise.reject({
          message: "Tarmoq xatosi — serverga ulanib bo'lmadi",
          status: 0,
          success: false,
        } satisfies ApiError)
      }
    )
  }

  // HTTP metodlar
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config)

    return response.data
  }
  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config)
    return response.data
  }
  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config)
    return response.data
  }
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config
    )
    return response.data
  }
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
