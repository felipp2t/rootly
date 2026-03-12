import {
  File02Icon,
  PlusSignIcon,
  UserGroup03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '../lib/utils'
import { Button } from './ui/button'

export interface Workspace {
  name: string
  memberCount: number
  itemCount: number
}

interface WorkspaceCardProps {
  workspace: Workspace
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const hasOneMember = workspace.memberCount === 1
  const hasOneItem = workspace.itemCount === 1
  return (
    <div
      className={cn(
        'group h-24 w-full border-zinc-800/50 border-2 rounded-md flex flex-col items-start gap-3 p-4 cursor-pointer transition-all text-left duration-150',
        // 'hover:outline-none hover:border-zinc-800/40 hover:ring-2 hover:ring-zinc-800/50 hover:ring-offset-2 hover:ring-offset-background',
        'bg-linear-to-r from-card to-card/50',
        'hover:brightness-125',
      )}
    >
      <p className='text-lg font-display font-semibold text-zinc-100 line-clamp-2 leading-snug'>
        {workspace.name}
      </p>
      <div className='mt-auto flex items-center gap-3 text-xs text-zinc-500'>
        <div className='flex items-center gap-1.5'>
          <HugeiconsIcon
            icon={UserGroup03Icon}
            size={18}
            className='text-zinc-400'
          />

          <span>
            {workspace.memberCount} {hasOneMember ? 'membro' : 'membros'}
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          <HugeiconsIcon
            icon={File02Icon}
            size={18}
            className='text-zinc-400'
          />
          <span>
            {workspace.itemCount} {hasOneItem ? 'item' : 'items'}
          </span>
        </div>
      </div>
    </div>
  )
}

export function NewWorkspaceCard({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant='ghost'
      type='button'
      className='h-24 w-full border border-dashed border-zinc-700 rounded-lg flex  items-center justify-center gap-2.5 cursor-pointer hover:border-zinc-500 hover:bg-zinc-800/30 transition-all'
    >
      <HugeiconsIcon icon={PlusSignIcon} size={18} color='#a1a1aa' />
      <span className='text-sm text-zinc-400'>Novo Workspace</span>
    </Button>
  )
}
