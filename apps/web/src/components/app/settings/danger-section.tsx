import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Loader2Icon, Trash2Icon } from 'lucide-react'
import { Suspense, useState } from 'react'
import { toast } from 'sonner'
import {
  getGetWorkspacesQueryKey,
  useDeleteWorkspace,
  useGetWorkspaceSuspense,
} from '@/api/workspaces/workspaces'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SecretInput } from '@/components/ui/secret-input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

export function DangerSection({ workspaceId }: { workspaceId: string }) {
  return (
    <Suspense fallback={<DangerSectionSkeleton />}>
      <DangerSectionLoader workspaceId={workspaceId} />
    </Suspense>
  )
}

function DangerSectionLoader({ workspaceId }: { workspaceId: string }) {
  const { user } = useAuth()
  const { data: workspaceRes } = useGetWorkspaceSuspense(workspaceId)
  const workspace =
    workspaceRes.status === 200 ? workspaceRes.data.workspace : null

  // Only the workspace owner can delete it.
  if (!workspace || !user || workspace.userId !== user.id) {
    return null
  }

  return <DeleteWorkspace workspaceId={workspaceId} name={workspace.name} />
}

function DeleteWorkspace({
  workspaceId,
  name,
}: {
  workspaceId: string
  name: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deleteMutation = useDeleteWorkspace()

  const [open, setOpen] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [password, setPassword] = useState('')

  const nameMatches = confirmName.trim() === name
  const canDelete = nameMatches && password.length > 0

  function reset() {
    setConfirmName('')
    setPassword('')
  }

  async function handleDelete() {
    if (!canDelete) return

    const response = await deleteMutation.mutateAsync({
      workspaceId,
      data: { password },
    })

    if (response.status === 204) {
      queryClient.invalidateQueries({ queryKey: getGetWorkspacesQueryKey() })
      toast.success('Workspace deleted successfully')
      setOpen(false)
      reset()
      navigate({ to: '/' })
    } else if (response.status === 401) {
      toast.error('Incorrect password')
    } else if (response.status === 403) {
      toast.error('Only the workspace owner can delete it')
    } else if (response.status === 404) {
      toast.error('Workspace not found')
    } else {
      toast.error('Failed to delete workspace. Please try again later.')
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <span className='font-mono text-sm font-bold uppercase tracking-wide text-destructive'>
        Danger Zone
      </span>

      <div className='flex flex-col gap-3 border border-destructive/30 p-4'>
        <div className='flex flex-col gap-1'>
          <span className='font-mono text-xs font-semibold uppercase tracking-wide'>
            Delete workspace
          </span>
          <span className='text-xs text-muted-foreground'>
            Permanently delete this workspace and all of its data. This action
            cannot be undone.
          </span>
        </div>

        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) reset()
          }}
        >
          <DialogTrigger asChild>
            <Button variant='destructive' className='w-fit cursor-pointer'>
              <Trash2Icon className='size-4' />
              DELETE WORKSPACE
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete workspace</DialogTitle>
              <DialogDescription>
                This action is permanent and cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <form
              className='flex flex-col gap-4 pt-2'
              onSubmit={(e) => {
                e.preventDefault()
                handleDelete()
              }}
            >
              <Field>
                <Label htmlFor='confirm-name' className='text-xs'>
                  Type{' '}
                  <span className='font-mono font-bold text-foreground'>
                    {name}
                  </span>{' '}
                  to confirm
                </Label>
                <Input
                  id='confirm-name'
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  autoComplete='off'
                  className={cn(
                    'border border-border rounded-none focus-visible:outline-none focus-visible:ring-0',
                  )}
                  placeholder={name}
                />
              </Field>

              <Field>
                <Label htmlFor='confirm-password' className='text-xs'>
                  Confirm your password
                </Label>
                <SecretInput
                  id='confirm-password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {confirmName.length > 0 && !nameMatches && (
                  <FieldError>Workspace name does not match</FieldError>
                )}
              </Field>

              <DialogFooter showCloseButton>
                <Button
                  type='submit'
                  variant='destructive'
                  disabled={!canDelete || deleteMutation.isPending}
                  className='cursor-pointer'
                >
                  {deleteMutation.isPending ? (
                    <Loader2Icon className='size-4 animate-spin' />
                  ) : (
                    <Trash2Icon className='size-4' />
                  )}
                  DELETE
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function DangerSectionSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-5 w-28' />
      <Skeleton className='h-24 w-full' />
    </div>
  )
}
