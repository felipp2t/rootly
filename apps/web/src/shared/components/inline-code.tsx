interface InlineCodeProps {
  children: React.ReactNode
}

export function InlineCode({ children }: InlineCodeProps) {
  return (
    <p className='text-xs text-muted-foreground font-mono font-bold uppercase'>
      {`//`} {children}
    </p>
  )
}
