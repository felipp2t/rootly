import { revalidateLogic, useForm } from '@tanstack/react-form'
import { Folder, PlusIcon, Settings2Icon, Shield, Users } from 'lucide-react'
import type * as React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import { createWorkspace } from '@/api/workspaces/workspaces'
import { cn } from '@/shared/lib/utils'
import { queryClient } from '../lib/query'
import { formatTimeAgo } from '../utils/format-time-ago'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Field, FieldError, FieldGroup } from './ui/field'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { Skeleton } from './ui/skeleton'

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
          UPDATED {formatTimeAgo(new Date(workspace.updatedAt))}
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

const newWorkspaceSchema = z.object({
  name: z.string().min(3, 'Workspace name must be at least 3 characters long'),
})

function NewWorkspaceCard({ className }: { className?: string }) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  const createWorkspaceForm = useForm({
    validators: { onSubmit: newWorkspaceSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      const response = await createWorkspace({ name: value.name })

      if (response.status === 201) {
        queryClient.invalidateQueries({ queryKey: ['workspaces'] })
        toast.success('Workspace created successfully')
        createWorkspaceForm.reset()
        setDialogIsOpen(false)
      }

      if (response.status === 500) {
        toast.error('Failed to create workspace. Please try again later.')
      }
    },
  })

  return (
    <Dialog open={dialogIsOpen} onOpenChange={(open) => setDialogIsOpen(open)}>
      <DialogTrigger asChild>
        <Button
          type='button'
          className={cn(
            'flex h-full min-h-39 w-full cursor-pointer items-center justify-center gap-2 border border-dashed border-border bg-transparent font-mono text-xs font-bold uppercase tracking-wide text-muted-foreground transition-all hover:border-primary/50 hover:text-primary',
            className,
          )}
        >
          <PlusIcon className='size-3.5' />
          NEW WORKSPACE
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>NEW WORKSPACE</DialogTitle>
        </DialogHeader>
        <form
          className='space-y-6 mt-6'
          onSubmit={(e) => {
            e.preventDefault()
            createWorkspaceForm.handleSubmit()
          }}
        >
          <FieldGroup>
            <createWorkspaceForm.Field
              name='name'
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete='off'
                      className={cn(
                        'border border-border focus-visible:border-primary/50 rounded-none focus-visible:outline-none focus-visible:ring-0',
                      )}
                      placeholder='my-workspace'
                    />
                    <FieldError>
                      {field.state.meta.errors[0]?.message}
                    </FieldError>
                  </Field>
                )
              }}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose>
              <Button variant='outline' className='cursor-pointer'>
                CANCEL
              </Button>
            </DialogClose>
            <Button className='cursor-pointer'>
              <PlusIcon className='size-3.5' />
              CREATE
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function WorkspaceCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot='workspace-card-skeleton'
      className={cn(
        'flex flex-col justify-between gap-3 border border-border bg-card p-5',
        className,
      )}
    >
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Skeleton className='size-4 shrink-0 rounded-none' />
            <Skeleton className='h-4 w-32 rounded-none' />
          </div>
          <Skeleton className='size-7 rounded-none' />
        </div>
        <Skeleton className='h-3 w-16 rounded-none' />
        <Skeleton className='h-3 w-24 rounded-none' />
      </div>

      <Separator />

      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1.5'>
          <Skeleton className='size-3.5 rounded-none' />
          <Skeleton className='h-3 w-16 rounded-none' />
        </div>
        <Skeleton className='h-3 w-1 rounded-none' />
        <div className='flex items-center gap-1.5'>
          <Skeleton className='size-3.5 rounded-none' />
          <Skeleton className='h-3 w-12 rounded-none' />
        </div>
      </div>
    </div>
  )
}

export { NewWorkspaceCard, WorkspaceCard, WorkspaceCardSkeleton }
