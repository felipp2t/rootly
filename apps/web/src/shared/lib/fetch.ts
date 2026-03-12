// Auth endpoints must not trigger the auto-refresh loop
const PUBLIC_PREFIXES = [
  'http://localhost:3333/api/sessions',
  'http://localhost:3333/api/accounts',
]

let isRefreshing = false
let queue: Array<(success: boolean) => void> = []

function flushQueue(success: boolean) {
  for (const cb of queue) cb(success)
  queue = []
}

async function doRefresh(): Promise<boolean> {
  const res = await fetch('http://localhost:3333/api/sessions/refresh', {
    method: 'POST',
    credentials: 'include',
  })
  return res.ok
}

async function parseResponse<T>(res: Response): Promise<T> {
  const body = [204, 205, 304].includes(res.status) ? null : await res.text()
  const data = (body ? JSON.parse(body) : {}) as T
  return { data, status: res.status, headers: res.headers } as T
}

export async function fetchWithAuth<T>(url: string, options: RequestInit): Promise<T> {
  let res = await fetch(url, { ...options, credentials: 'include' })

  if (res.status !== 401) return parseResponse<T>(res)

  if (PUBLIC_PREFIXES.some((prefix) => url.startsWith(prefix))) {
    return parseResponse<T>(res)
  }

  if (isRefreshing) {
    const success = await new Promise<boolean>((resolve) => {
      queue.push(resolve)
    })
    if (!success) throw new Error('Session expired')
    res = await fetch(url, { ...options, credentials: 'include' })
  } else {
    isRefreshing = true
    const success = await doRefresh()
    isRefreshing = false
    flushQueue(success)

    if (!success) {
      if (window.location.pathname !== '/session') {
        window.location.href = '/session'
      }
      throw new Error('Session expired')
    }

    res = await fetch(url, { ...options, credentials: 'include' })
  }

  return parseResponse<T>(res)
}
