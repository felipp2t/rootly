import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/shared/lib/utils'

const button = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 border border-transparent bg-clip-padding font-mono text-xs font-bold uppercase tracking-[0.05em] whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:brightness-110',
        outline:
          'border-accent bg-outline text-muted-foreground hover:text-foreground aria-expanded:text-foreground',
        secondary:
          'border-border bg-accent text-muted-foreground hover:text-foreground',
        ghost:
          'hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground',
        destructive:
          'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 gap-2 px-4',
        xs: "h-6 gap-1 px-2 text-[9px] [&_svg:not([class*='size-'])]:size-2.5",
        sm: 'h-8 gap-1.5 px-3',
        lg: 'h-11 gap-2 px-5 text-xs',
        icon: 'size-9',
        'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-2.5",
        'icon-sm': 'size-8',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof button> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot='button'
      data-variant={variant}
      data-size={size}
      className={cn(button({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, button }
