import { useQueryClient } from '@tanstack/react-query'
import { CheckIcon, MinusIcon, ShieldIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  getGetRolePermissionsQueryKey,
  useGetRolePermissionsSuspense,
  useSetRolePermissions,
} from '@/api/roles/roles'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ACTIONS,
  type Action,
  fromMatrix,
  isPermissionAllowed,
  type Permissions,
  RESOURCES,
  type Resource,
  toMatrix,
} from '@/constants/permissions'
import { useWorkspacePermissions } from '@/hooks/use-workspace-permissions'
import { cn } from '@/lib/utils'

export function PermissionsPanel({
  workspaceId,
  roleId,
  roleName,
  canDelete,
  isDeleting,
  onDelete,
}: {
  workspaceId: string
  roleId: string
  roleName: string
  canDelete: boolean
  isDeleting: boolean
  onDelete: () => void
}) {
  const queryClient = useQueryClient()
  const { can } = useWorkspacePermissions(workspaceId)
  const canUpdate = can('role', 'update')
  const { data: permsRes } = useGetRolePermissionsSuspense(workspaceId, roleId)
  const serverPermissions =
    permsRes.status === 200 ? permsRes.data.permissions : []

  const [localMatrix, setLocalMatrix] = useState<Permissions>(() =>
    toMatrix(serverPermissions),
  )

  // Re-sync from the server whenever the query data changes (role switch or
  // refetch after save). The backend normalizes `all` vs granular actions, so
  // the local matrix must reflect the persisted result, not the submitted one.
  useEffect(() => {
    setLocalMatrix(toMatrix(serverPermissions))
  }, [permsRes])

  const setPermsMutation = useSetRolePermissions()

  function togglePermission(resource: Resource, action: Action) {
    setLocalMatrix((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource]?.[action],
      },
    }))
  }

  function handleSave() {
    setPermsMutation.mutate(
      {
        workspaceId,
        roleId,
        data: { permissions: fromMatrix(localMatrix) },
      },
      {
        onSuccess: (res) => {
          if (res.status === 204) {
            queryClient.invalidateQueries({
              queryKey: getGetRolePermissionsQueryKey(workspaceId, roleId),
            })
            toast.success('Permissions saved')
          } else {
            toast.error('Failed to save permissions')
          }
        },
        onError: () => toast.error('Failed to save permissions'),
      },
    )
  }

  const totalGranted = Object.values(localMatrix).reduce(
    (sum, perms) => sum + Object.values(perms).filter(Boolean).length,
    0,
  )

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <ShieldIcon className='size-4 text-primary' />
          <span className='font-mono text-sm font-bold uppercase tracking-wide'>
            {roleName}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            className='cursor-pointer font-mono text-xs uppercase'
            onClick={handleSave}
            disabled={setPermsMutation.isPending || !canUpdate}
          >
            {setPermsMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          {canDelete && (
            <Button
              size='sm'
              variant='outline'
              aria-label={`Delete ${roleName}`}
              className='cursor-pointer font-mono text-xs uppercase border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2Icon className='size-3.5' />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      </div>

      <div className='border border-border overflow-auto'>
        {/* Header */}
        <div className='grid grid-cols-[140px_repeat(6,1fr)] bg-muted/30'>
          <div className='px-4 py-2.5 font-mono text-xs font-semibold text-muted-foreground uppercase border-r border-border'>
            Resource
          </div>
          {ACTIONS.map((action) => (
            <div
              key={action}
              className='px-2 py-2.5 font-mono text-xs font-semibold text-muted-foreground uppercase text-center border-r border-border last:border-r-0'
            >
              {action}
            </div>
          ))}
        </div>

        <Separator />

        {/* Rows */}
        {RESOURCES.map((resource, i) => (
          <div
            key={resource}
            className={cn(
              'grid grid-cols-[140px_repeat(6,1fr)]',
              i % 2 === 0 ? 'bg-card' : 'bg-muted/10',
            )}
          >
            <div className='px-4 py-3 font-mono text-xs font-semibold uppercase text-foreground border-r border-border flex items-center'>
              {resource}
            </div>
            {ACTIONS.map((action) => {
              const checked = localMatrix[resource]?.[action] ?? false
              const allowed = isPermissionAllowed(resource, action)
              return (
                <div
                  key={action}
                  className='flex items-center justify-center border-r border-border last:border-r-0 py-3'
                >
                  {allowed ? (
                    <button
                      type='button'
                      onClick={
                        canUpdate
                          ? () => togglePermission(resource, action)
                          : undefined
                      }
                      className={cn(
                        'size-4 flex items-center justify-center border transition-colors',
                        canUpdate
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed opacity-60',
                        checked
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-transparent hover:border-primary/50',
                      )}
                    >
                      {checked ? (
                        <CheckIcon className='size-2.5' strokeWidth={3} />
                      ) : (
                        <MinusIcon className='size-2.5 opacity-0' />
                      )}
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <p className='font-mono text-xs text-muted-foreground'>
        {totalGranted} permissions assigned
      </p>
    </div>
  )
}

export function PermissionsMatrixSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-5 w-24' />
        <Skeleton className='h-8 w-28' />
      </div>
      <Skeleton className='h-52 w-full' />
    </div>
  )
}
