import { Loader2Icon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function NotificationRoot({
  unread = false,
  className,
  children,
  ...props
}: ComponentProps<'div'> & { unread?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 border-b border-border px-3 py-2.5 last:border-b-0',
        unread && 'bg-primary/5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function NotificationHeader({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  )
}

export function NotificationIndicator({ show = true }: { show?: boolean }) {
  if (!show) return null
  return <span className='size-1.5 shrink-0 rounded-full bg-primary' />
}

export function NotificationTitle({
  className,
  children,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'font-mono text-xs font-semibold uppercase tracking-wide truncate',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function NotificationContent({
  className,
  children,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn('font-mono text-xs text-muted-foreground', className)}
      {...props}
    >
      {children}
    </span>
  )
}

export function NotificationActions({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-center gap-2 pt-1', className)} {...props}>
      {children}
    </div>
  )
}

type NotificationActionProps = Omit<ComponentProps<'button'>, 'children'> & {
  variant?: 'default' | 'outline' | 'ghost'
  pending?: boolean
  children: ReactNode
}

export function NotificationAction({
  variant = 'outline',
  pending = false,
  className,
  children,
  disabled,
  ...props
}: NotificationActionProps) {
  const variants = {
    default: 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20',
    outline: 'border-border text-foreground hover:bg-muted/30',
    ghost: 'border-transparent text-muted-foreground hover:bg-muted/30',
  }

  return (
    <button
      type='button'
      disabled={disabled || pending}
      className={cn(
        'flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide outline-none transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed',
        variants[variant],
        className,
      )}
      {...props}
    >
      {pending && <Loader2Icon className='size-3 shrink-0 animate-spin' />}
      {children}
    </button>
  )
}
