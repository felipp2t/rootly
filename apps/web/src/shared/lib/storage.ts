export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  THEME: 'vite-ui-theme',
} as const

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

/**
 * Type-safe localStorage wrapper with browser check
 */
export const storage = {
  get: (key: StorageKey): string | null => {
    if (!isBrowser()) return null
    return localStorage.getItem(key)
  },

  set: (key: StorageKey, value: string): void => {
    if (!isBrowser()) return
    localStorage.setItem(key, value)
  },

  remove: (key: StorageKey): void => {
    if (!isBrowser()) return
    localStorage.removeItem(key)
  },

  clear: (): void => {
    if (isBrowser()) localStorage.clear()
  },
} as const
