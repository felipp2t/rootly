import { cn } from '../lib/utils'

interface InlineCodeRootProps extends React.ComponentProps<'div'> {
  children: React.ReactNode
}

export function InlineCodeRoot({ children, className }: InlineCodeRootProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>{children}</div>
  )
}

interface InlineCodeTextProps extends React.ComponentProps<'p'> {
  children: React.ReactNode
}

export function InlineCodeText({ children, className }: InlineCodeTextProps) {
  return (
    <p
      className={cn(
        'text-xs text-muted-foreground font-mono font-bold uppercase',
        className,
      )}
    >
      {children}
    </p>
  )
}

interface InlineCodeAddonProps extends React.ComponentProps<'p'> {
  children: React.ReactNode
}

export function InlineCodeAddon({ children, className }: InlineCodeAddonProps) {
  return (
    <p
      className={cn(
        'text-xs text-muted-foreground font-mono font-bold uppercase',
        className,
      )}
    >
      {children}
    </p>
  )
}
