import { useQueryClient } from '@tanstack/react-query'
import { PlusIcon, ShieldIcon } from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  getGetRolesQueryKey,
  useCreateRole,
  useDeleteRole,
  useGetRolesSuspense,
} from '@/api/roles/roles'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useWorkspacePermissions } from '@/hooks/use-workspace-permissions'
import { cn } from '@/lib/utils'
import {
  PermissionsMatrixSkeleton,
  PermissionsPanel,
} from './permissions-panel'

export function RolesSection({ workspaceId }: { workspaceId: string }) {
  return (
    <Suspense fallback={<RolesSectionSkeleton />}>
      <RolesSectionLoader workspaceId={workspaceId} />
    </Suspense>
  )
}

function RolesSectionLoader({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient()
  const { data: rolesRes, isFetching } = useGetRolesSuspense(workspaceId)
  const roles = rolesRes.status === 200 ? rolesRes.data.roles : []
  const { can } = useWorkspacePermissions(workspaceId)

  const canCreate = can('role', 'create')
  const canDelete = can('role', 'delete')

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const roleId = selectedRoleId ?? roles[0]?.id ?? null

  const [creating, setCreating] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (creating) inputRef.current?.focus()
  }, [creating])

  const createRoleMutation = useCreateRole()
  const deleteRoleMutation = useDeleteRole()

  function handleCreateRole() {
    const name = newRoleName.trim()
    if (!name) {
      setCreating(false)
      return
    }
    createRoleMutation.mutate(
      { workspaceId, data: { name } },
      {
        onSuccess: (res) => {
          if (res.status === 201) {
            setSelectedRoleId(res.data.roleId)
            queryClient.invalidateQueries({
              queryKey: getGetRolesQueryKey(workspaceId),
            })
            toast.success(`Role "${name}" created`)
          } else if (res.status === 409) {
            toast.error('Role already exists')
          } else {
            toast.error('Failed to create role')
          }
          setCreating(false)
          setNewRoleName('')
        },
        onError: () => {
          toast.error('Failed to create role')
          setCreating(false)
          setNewRoleName('')
        },
      },
    )
  }

  function handleDeleteRole(id: string) {
    deleteRoleMutation.mutate(
      { workspaceId, roleId: id },
      {
        onSuccess: (res) => {
          if (res.status === 204) {
            if (selectedRoleId === id) setSelectedRoleId(null)
            queryClient.invalidateQueries({
              queryKey: getGetRolesQueryKey(workspaceId),
            })
            toast.success('Role deleted')
          } else if (res.status === 409) {
            toast.error('Cannot delete role: members are still assigned')
          } else {
            toast.error('Failed to delete role')
          }
        },
        onError: () => toast.error('Failed to delete role'),
      },
    )
  }

  return (
    <div className='flex gap-6'>
      {/* Roles list */}
      <ScrollArea>
        <div className='w-52 max-h-20 shrink-0 flex flex-col gap-2'>
          <div className='flex items-center justify-between mb-1'>
            <span className='font-mono text-xs font-semibold text-muted-foreground uppercase'>
              Roles
            </span>
            {!creating && canCreate && (
              <Button
                size='icon-sm'
                variant='ghost'
                className='cursor-pointer'
                onClick={() => setCreating(true)}
              >
                <PlusIcon className='size-3.5' />
              </Button>
            )}
          </div>

          {creating && (
            <input
              ref={inputRef}
              className='px-3 py-2 border border-primary/50 bg-transparent font-mono text-xs font-semibold uppercase tracking-wide text-foreground outline-none placeholder:text-muted-foreground'
              placeholder='Role name...'
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateRole()
                if (e.key === 'Escape') {
                  setCreating(false)
                  setNewRoleName('')
                }
              }}
              onBlur={handleCreateRole}
            />
          )}

          {isFetching ? (
            <RolesListSkeleton count={Math.max(roles.length, 1)} />
          ) : (
            <>
              {roles.map((role) => (
                <button
                  key={role.id}
                  type='button'
                  onClick={() => setSelectedRoleId(role.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 border font-mono text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer text-left',
                    roleId === role.id
                      ? 'border-primary/50 bg-primary/5 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground',
                  )}
                >
                  <ShieldIcon className='size-3.5 shrink-0' />
                  {role.name}
                </button>
              ))}

              {roles.length === 0 && !creating && (
                <p className='font-mono text-xs text-muted-foreground px-1'>
                  No roles yet
                </p>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <Separator orientation='vertical' className='h-auto' />

      {/* Permission matrix */}
      <div className='flex-1 min-w-0'>
        {roleId ? (
          <Suspense fallback={<PermissionsMatrixSkeleton />}>
            <PermissionsPanel
              workspaceId={workspaceId}
              roleId={roleId}
              roleName={roles.find((r) => r.id === roleId)?.name ?? ''}
              canDelete={canDelete}
              isDeleting={deleteRoleMutation.isPending}
              onDelete={() => handleDeleteRole(roleId)}
            />
          </Suspense>
        ) : (
          <div className='flex items-center justify-center h-32'>
            <p className='font-mono text-xs text-muted-foreground'>
              Select a role to view permissions
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function RolesListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className='h-10.5 w-full' />
      ))}
    </>
  )
}

function RolesSectionSkeleton() {
  return (
    <div className='flex gap-6'>
      <div className='w-52 shrink-0 flex flex-col gap-2'>
        <Skeleton className='h-4 w-12 mb-1' />
        <RolesListSkeleton />
      </div>
      <Separator orientation='vertical' className='h-auto' />
      <div className='flex-1'>
        <PermissionsMatrixSkeleton />
      </div>
    </div>
  )
}
