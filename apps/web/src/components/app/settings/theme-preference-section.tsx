import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
] as const

export function ThemePreferenceSection() {
  const { theme, setTheme } = useTheme()

  return (
    <div className='flex flex-col gap-4'>
      <span className='font-mono text-sm font-bold uppercase tracking-wide'>
        Preferences
      </span>

      <div className='flex flex-col gap-2'>
        <span className='font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          Appearance
        </span>

        <div className='flex gap-2'>
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon
            const isActive = theme === option.value

            return (
              <button
                key={option.value}
                type='button'
                onClick={() => setTheme(option.value)}
                className={cn(
                  'flex flex-1 cursor-pointer flex-col items-center gap-2 border-2 bg-card px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wide transition-all',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                )}
              >
                <Icon className='size-4' />
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
