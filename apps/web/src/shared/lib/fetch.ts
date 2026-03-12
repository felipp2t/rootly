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

  const res = await fetch('http://localhost:3333/api/sessions/refresh', {
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

function withAuthHeader(
  options: RequestInit,
  token: string | null,
): RequestInit {
  if (!token) return options
  return {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const body = [204, 205, 304].includes(res.status) ? null : await res.text()
  const data = (body ? JSON.parse(body) : {}) as T
  return { data, status: res.status, headers: res.headers } as T
}

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit,
): Promise<T> {
  let res = await fetch(url, withAuthHeader(options, accessToken))

  if (res.status !== 401) return parseResponse<T>(res)

  // If there's no accessToken, the 401 came from a public/unauthenticated request
  // (e.g. wrong credentials on login). Don't attempt refresh, just return the response.
  if (!accessToken && !storage.get(STORAGE_KEYS.REFRESH_TOKEN)) {
    return parseResponse<T>(res)
  }

  if (isRefreshing) {
    const newToken = await new Promise<string | null>((resolve) => {
      queue.push(resolve)
    })
    if (!newToken) throw new Error('Session expired')
    res = await fetch(url, withAuthHeader(options, newToken))
  } else {
    isRefreshing = true
    const newToken = await doRefresh()
    isRefreshing = false
    flushQueue(newToken)

    if (!newToken) {
      window.location.href = '/session'
      throw new Error('Session expired')
    }

    res = await fetch(url, withAuthHeader(options, newToken))
  }

  return parseResponse<T>(res)
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
