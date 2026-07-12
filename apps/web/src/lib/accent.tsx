import { createContext, useContext, useEffect, useState } from 'react'
import { STORAGE_KEYS, storage } from '@/lib/storage'

export const ACCENT_OPTIONS = [
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'red', label: 'Red' },
  { value: 'pink', label: 'Pink' },
  { value: 'cyan', label: 'Cyan' },
] as const

export type Accent = (typeof ACCENT_OPTIONS)[number]['value']

export const DEFAULT_ACCENT: Accent = 'green'

const ACCENT_VALUES: readonly string[] = ACCENT_OPTIONS.map(
  (option) => option.value,
)

function isAccent(value: string | null): value is Accent {
  return value !== null && ACCENT_VALUES.includes(value)
}

interface AccentContextValue {
  accent: Accent
  setAccent: (accent: Accent) => void
}

const AccentContext = createContext<AccentContextValue | undefined>(undefined)

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>(() => {
    const stored = storage.get(STORAGE_KEYS.ACCENT)
    return isAccent(stored) ? stored : DEFAULT_ACCENT
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent)
  }, [accent])

  function setAccent(next: Accent) {
    storage.set(STORAGE_KEYS.ACCENT, next)
    setAccentState(next)
  }

  return (
    <AccentContext.Provider value={{ accent, setAccent }}>
      {children}
    </AccentContext.Provider>
  )
}

export function useAccent() {
  const context = useContext(AccentContext)
  if (!context) {
    throw new Error('useAccent must be used within AccentProvider')
  }
  return context
}
