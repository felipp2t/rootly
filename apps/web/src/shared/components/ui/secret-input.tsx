import { EyeIcon, EyeOffIcon } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/shared/lib/utils'
import { Input } from './input'

interface SecretInputProps {
  id?: string
  name?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  'aria-invalid'?: boolean
}

export function SecretInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  'aria-invalid': ariaInvalid,
}: SecretInputProps) {
  const [showSecret, setShowSecret] = React.useState(false)

  return (
    <div
      className={cn(
        'flex items-center border border-amber-600/20 rounded-none',
        'focus-within:border-amber-600',
      )}
    >
      <Input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={ariaInvalid}
        autoComplete='off'
        type={showSecret ? 'text' : 'password'}
        className={cn(
          'flex-1 px-3 py-2.5 rounded-none border-0 outline-none  text-amber-500',
          'focus-visible:ring-0 focus-visible:outline-none',
          'placeholder:text-amber-500/40',
        )}
      />
      <button
        type='button'
        onClick={() => setShowSecret((v) => !v)}
        className={cn('px-3 py-2.5 cursor-pointer', 'dark:bg-input/30')}
      >
        {showSecret ? (
          <EyeOffIcon className='size-4 text-muted-foreground' />
        ) : (
          <EyeIcon className='size-4 text-muted-foreground' />
        )}
      </button>
    </div>
  )
}
