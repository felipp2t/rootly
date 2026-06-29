import { cva, type VariantProps } from 'class-variance-authority'
import { CheckIcon } from 'lucide-react'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const dropdownMenuItemVariants = cva(
  'relative flex cursor-pointer select-none items-center gap-2 px-2.5 py-2 font-mono text-xs font-semibold uppercase tracking-wide outline-none transition-colors data-disabled:pointer-events-none data-disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground focus:bg-primary/5 focus:text-primary',
        destructive: 'text-red-400 focus:bg-red-500/20 focus:text-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot='dropdown-menu' {...props} />
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot='dropdown-menu-trigger'
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot='dropdown-menu-content'
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-32 overflow-hidden border border-border bg-card p-1 text-foreground shadow-lg duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuItem({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> &
  VariantProps<typeof dropdownMenuItemVariants>) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot='dropdown-menu-item'
      className={cn(dropdownMenuItemVariants({ variant }), className)}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot='dropdown-menu-checkbox-item'
      checked={checked}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 py-2 pr-2.5 pl-7 font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground outline-none transition-colors focus:bg-primary/5 focus:text-primary data-[state=checked]:text-primary data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span className='absolute left-2 flex size-3.5 items-center justify-center'>
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className='size-3.5' />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot='dropdown-menu-label'
      className={cn(
        'px-2.5 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot='dropdown-menu-separator'
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
}
