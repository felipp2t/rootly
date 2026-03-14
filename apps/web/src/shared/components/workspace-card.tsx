import { Folder, Plus, Settings2Icon, Shield, Users } from 'lucide-react'
import type * as React from 'react'
import { cn } from '@/shared/lib/utils'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

export interface Workspace {
  name: string
  itemCount: number
  updatedAt: string
  memberCount: number
  roleCount: number
}

interface WorkspaceCardProps extends React.ComponentProps<'div'> {
  workspace: Workspace
  onSettings?: () => void
}

function WorkspaceCard({
  workspace,
  onSettings,
  className,
  ...props
}: WorkspaceCardProps) {
  return (
    <div
      data-slot='workspace-card'
      className={cn(
        'flex cursor-pointer flex-col justify-between gap-3 border border-border hover:border-primary/50 bg-card p-5',
        className,
      )}
      {...props}
    >
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Folder className='size-4 shrink-0 text-primary' />
            <span className='font-mono text-sm font-bold uppercase tracking-wide text-foreground truncate'>
              {workspace.name}
            </span>
          </div>
          <Button
            size='icon-sm'
            className='cursor-pointer group bg-transparent'
          >
            <Settings2Icon className='size-4 group-hover:text-white text-muted-foreground transition-all' />
          </Button>
        </div>
        <span className='font-mono text-xs font-medium text-muted-foreground uppercase'>
          {workspace.itemCount} ITEMS
        </span>
        <span className='font-mono text-xs font-medium text-muted-foreground uppercase'>
          UPDATED {workspace.updatedAt}
        </span>
      </div>

      <Separator />

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1.5'>
            <Users className='size-3.5 text-muted-foreground' />
            <span className='font-mono text-sm font-medium text-muted-foreground'>
              {workspace.memberCount}{' '}
              {workspace.memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>
          <span className='font-mono text-[10px] text-border'>·</span>
          <div className='flex items-center gap-1.5'>
            <Shield className='size-3.5 text-muted-foreground' />
            <span className='font-mono text-sm font-medium text-muted-foreground'>
              {workspace.roleCount}{' '}
              {workspace.roleCount === 1 ? 'role' : 'roles'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function NewWorkspaceCard({
  onClick,
  className,
}: {
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex h-full min-h-39 w-full cursor-pointer items-center justify-center gap-2 border border-dashed border-border bg-transparent font-mono text-xs font-bold uppercase tracking-wide text-muted-foreground transition-all hover:border-primary/50 hover:text-primary',
        className,
      )}
    >
      <Plus className='size-3.5' />
      NEW WORKSPACE
    </button>
  )
}

export { NewWorkspaceCard, WorkspaceCard }
