import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  CheckIcon,
  MinusIcon,
  PlusIcon,
  SettingsIcon,
  ShieldIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useGetWorkspaceMembersSuspense } from '@/api/members/members'
import type {
  GetRolePermissions200PermissionsItemAction,
  GetRolePermissions200PermissionsItemResource,
} from '@/api/model'
import {
  getGetRolePermissionsQueryKey,
  getGetRolesQueryKey,
  useCreateRole,
  useDeleteRole,
  useGetRolePermissionsSuspense,
  useGetRolesSuspense,
  useSetRolePermissions,
} from '@/api/roles/roles'
import {
  InlineCodeContent,
  InlineCodeRoot,
  InlineCodeSeparator,
  InlineCodeText,
} from '@/components/inline-code'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useWorkspacePermissions } from '@/hooks/use-workspace-permissions'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/$workspaceId/settings')({
  component: RouteComponent,
})

const RESOURCES = [
  'workspace',
  'folder',
  'item',
  'tag',
  'member',
  'role',
] as const
const ACTIONS = ['read', 'create', 'update', 'delete', 'invite', 'all'] as const

// Combinations that are not meaningful in the domain. Workspaces are created
// freely by any user, so `workspace:create` cannot be gated by a role.
const DISALLOWED_PERMISSIONS: { resource: Resource; action: Action }[] = [
  { resource: 'workspace', action: 'create' },
]

function isPermissionAllowed(resource: Resource, action: Action): boolean {
  return !DISALLOWED_PERMISSIONS.some(
    (p) => p.resource === resource && p.action === action,
  )
}

type Resource = GetRolePermissions200PermissionsItemResource
type Action = GetRolePermissions200PermissionsItemAction
type Permissions = Record<Resource, Partial<Record<Action, boolean>>>

function toMatrix(
  permissions: { resource: Resource; action: Action }[],
): Permissions {
  const matrix = {} as Permissions
  for (const { resource, action } of permissions) {
    if (!matrix[resource]) matrix[resource] = {}
    matrix[resource][action] = true
  }
  return matrix
}

function fromMatrix(
  matrix: Permissions,
): { resource: Resource; action: Action }[] {
  return Object.entries(matrix).flatMap(([resource, actions]) =>
    Object.entries(actions ?? {})
      .filter(([, v]) => v)
      .map(([action]) => ({
        resource: resource as Resource,
        action: action as Action,
      }))
      .filter(({ resource, action }) => isPermissionAllowed(resource, action)),
  )
}

type SettingsSection = 'general' | 'members' | 'roles'

const NAV_ITEMS: {
  id: SettingsSection
  label: string
  icon: React.ElementType
}[] = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'members', label: 'Members', icon: UsersIcon },
  { id: 'roles', label: 'Roles & Permissions', icon: ShieldIcon },
]

function RouteComponent() {
  const { workspaceId } = Route.useParams()
  const [activeSection, setActiveSection] = useState<SettingsSection>('roles')

  return (
    <main className='container mx-auto px-8 py-12 space-y-6'>
      <div className='flex flex-col gap-6'>
        <InlineCodeRoot>
          <InlineCodeContent>
            <Link to='/' className='group'>
              <InlineCodeText className='transition-colors group-hover:text-foreground'>
                Workspaces
              </InlineCodeText>
            </Link>
            <InlineCodeSeparator />
            <Link to='/$workspaceId' params={{ workspaceId }} className='group'>
              <InlineCodeText className='transition-colors group-hover:text-foreground'>
                {workspaceId}
              </InlineCodeText>
            </Link>
            <InlineCodeSeparator />
            <InlineCodeText className='text-primary'>Settings</InlineCodeText>
            <InlineCodeSeparator />
          </InlineCodeContent>
        </InlineCodeRoot>

        <div className='flex items-center gap-4'>
          <SettingsIcon className='size-6 shrink-0 text-primary' />
          <h1 className='text-3xl font-bold font-mono'>SETTINGS</h1>
        </div>
      </div>

      <div className='flex gap-8'>
        <nav className='flex flex-col gap-1 w-52 shrink-0'>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type='button'
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-left font-mono text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border-l-2 border-transparent',
                )}
              >
                <Icon className='size-3.5 shrink-0' />
                {item.label}
              </button>
            )
          })}
        </nav>

        <Separator orientation='vertical' className='h-auto' />

        <div className='flex-1 min-w-0'>
          {activeSection === 'roles' && (
            <Suspense fallback={<RolesSectionSkeleton />}>
              <RolesSectionLoader workspaceId={workspaceId} />
            </Suspense>
          )}
          {activeSection === 'general' && <GeneralSection />}
          {activeSection === 'members' && (
            <Suspense fallback={<MembersSectionSkeleton />}>
              <MembersSectionLoader workspaceId={workspaceId} />
            </Suspense>
          )}
        </div>
      </div>
    </main>
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

function PermissionsPanel({
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

function PermissionsMatrixSkeleton() {
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

function GeneralSection() {
  return (
    <div className='flex flex-col gap-4'>
      <span className='font-mono text-sm font-bold uppercase tracking-wide'>
        General
      </span>
      <div className='p-6 flex items-center justify-center'>
        <p className='font-mono text-xs text-muted-foreground'>Coming soon</p>
      </div>
    </div>
  )
}

function MembersSectionLoader({ workspaceId }: { workspaceId: string }) {
  const { data: membersRes } = useGetWorkspaceMembersSuspense(workspaceId)
  const members = membersRes.status === 200 ? membersRes.data.members : []

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <span className='font-mono text-sm font-bold uppercase tracking-wide'>
          Members
        </span>
        <span className='font-mono text-xs text-muted-foreground'>
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      {members.length === 0 ? (
        <div className='border border-border bg-card p-6 flex items-center justify-center'>
          <p className='font-mono text-xs text-muted-foreground'>
            No members yet
          </p>
        </div>
      ) : (
        <ScrollArea type='always'>
          <div className='max-h-120'>
            <div className='border border-border divide-y divide-border'>
              {members.map((member, i) => (
                <div
                  key={member.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    i % 2 === 0 ? 'bg-card' : 'bg-muted/10',
                  )}
                >
                  <div className='size-8 shrink-0 flex items-center justify-center border border-border bg-muted/30 font-mono text-xs font-bold uppercase text-primary'>
                    {member.name.charAt(0)}
                  </div>
                  <div className='flex flex-col min-w-0 flex-1'>
                    <span className='font-mono text-xs font-semibold uppercase tracking-wide truncate'>
                      {member.name}
                    </span>
                    <span className='font-mono text-xs text-muted-foreground truncate'>
                      {member.email}
                    </span>
                  </div>
                  <div className='flex items-center gap-1.5 shrink-0 px-2 py-1 border border-primary/50 bg-primary/5 text-primary'>
                    <ShieldIcon className='size-3 shrink-0' />
                    <span className='font-mono text-xs font-semibold uppercase tracking-wide'>
                      {member.roleName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

function MembersSectionSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-5 w-24' />
        <Skeleton className='h-4 w-16' />
      </div>
      <div className='border border-border divide-y divide-border'>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className='flex items-center gap-3 px-4 py-3'>
            <Skeleton className='size-8 shrink-0' />
            <div className='flex flex-col gap-1.5 flex-1'>
              <Skeleton className='h-3 w-32' />
              <Skeleton className='h-3 w-40' />
            </div>
            <Skeleton className='h-6 w-20' />
          </div>
        ))}
      </div>
    </div>
  )
}
