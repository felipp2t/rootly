import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const badge = cva(
  'inline-flex items-center font-mono text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 border',
  {
    variants: {
      variant: {
        default: 'bg-accent border-foreground/15 text-muted-foreground',
        document: 'bg-primary/5 border-primary/25 text-primary',
        secret: 'bg-[#FF8800]/10 border-[#FF8800]/25 text-[#FF8800]',
        link: 'bg-accent border-foreground/15 text-muted-foreground',
        text: 'bg-accent border-foreground/15 text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badge>) {
  return (
    <span
      data-slot='badge'
      data-variant={variant}
      className={cn(badge({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, badge }
