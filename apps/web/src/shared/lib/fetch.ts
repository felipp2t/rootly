import { STORAGE_KEYS, storage } from './storage'

let accessToken: string | null = null

let isRefreshing = false
let queue: Array<(token: string | null) => void> = []

function flushQueue(token: string | null) {
  for (const cb of queue) {
    cb(token)
  }
  queue = []
}

async function doRefresh(): Promise<string | null> {
  const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN)
  if (!refreshToken) return null

  const res = await fetch('http://localhost:3000/api/sessions/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
    accessToken = null
    return null
  }

  const data = await res.json()
  accessToken = data.accessToken
  storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken)
  return data.accessToken
}

export async function fetchWithAuth<T>(
  config: {
    url: string
    method: string
    params?: Record<string, unknown>
    data?: unknown
    headers?: Record<string, string>
    responseType?: string
  },
  options?: RequestInit,
): Promise<T> {
  const makeRequest = async (token: string | null) => {
    const url = new URL(config.url)
    if (config.params) {
      for (const [k, v] of Object.entries(config.params)) {
        url.searchParams.set(k, String(v))
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
    if (token) headers.Authorization = `Bearer ${token}`

    return fetch(url.toString(), {
      ...options,
      method: config.method.toUpperCase(),
      headers,
      body: config.data != null ? JSON.stringify(config.data) : undefined,
    })
  }

  let res = await makeRequest(accessToken)

  if (res.status !== 401) {
    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    return (body ? JSON.parse(body) : {}) as T
  }

  if (isRefreshing) {
    const newToken = await new Promise<string | null>((resolve) => {
      queue.push(resolve)
    })

    if (!newToken) throw new Error('Session expired')
    res = await makeRequest(newToken)
  } else {
    isRefreshing = true
    const newToken = await doRefresh()
    isRefreshing = false
    flushQueue(newToken)

    if (!newToken) {
      window.location.href = '/session'
      throw new Error('Session expired')
    }

    res = await makeRequest(newToken)
  }

  const body = [204, 205, 304].includes(res.status) ? null : await res.text()
  return (body ? JSON.parse(body) : {}) as T
}

export const tokenStore = {
  set(at: string, rt: string) {
    accessToken = at
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, rt)
  },
  clear() {
    accessToken = null
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
  },
}
