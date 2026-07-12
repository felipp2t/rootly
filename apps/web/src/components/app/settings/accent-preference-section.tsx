import { CheckIcon } from 'lucide-react'
import { ACCENT_OPTIONS, type Accent, useAccent } from '@/lib/accent'
import { cn } from '@/lib/utils'

const ACCENT_SWATCH_CLASSNAMES: Record<Accent, string> = {
  green: 'bg-[#00ff88]',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  pink: 'bg-pink-500',
  cyan: 'bg-cyan-500',
}

export function AccentPreferenceSection() {
  const { accent, setAccent } = useAccent()

  return (
    <div className='flex flex-col gap-4'>
      <span className='font-mono text-sm font-bold uppercase tracking-wide'>
        Accent color
      </span>

      <div className='flex flex-col gap-2'>
        <span className='font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          Color
        </span>

        <div className='flex flex-wrap gap-3'>
          {ACCENT_OPTIONS.map((option) => {
            const isActive = accent === option.value

            return (
              <button
                key={option.value}
                type='button'
                onClick={() => setAccent(option.value)}
                title={option.label}
                aria-label={option.label}
                aria-pressed={isActive}
                className={cn(
                  'flex size-9 cursor-pointer items-center justify-center rounded-full border-2 transition-all',
                  isActive
                    ? 'border-foreground'
                    : 'border-transparent hover:border-border',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full',
                    ACCENT_SWATCH_CLASSNAMES[option.value],
                  )}
                >
                  {isActive && <CheckIcon className='size-3.5 text-black/70' />}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
