import { EyeIcon, EyeOffIcon, KeyIcon } from 'lucide-react'
import * as React from 'react'
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
    <div className='flex items-center border border-amber-600/20 focus-within:border-amber-600 rounded-none'>
      <Input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={ariaInvalid}
        autoComplete='off'
        type={showSecret ? 'text' : 'password'}
        placeholder='Enter secret value'
        className='flex-1 px-3 py-2.5 border-0 outline-none focus-visible:ring-0 focus-visible:outline-none text-amber-500 placeholder:text-amber-500/40'
      />
      <button
        type='button'
        onClick={() => setShowSecret((v) => !v)}
        className='px-3 py-2.5 dark:bg-input/30 cursor-pointer'
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
