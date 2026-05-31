import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronDownIcon,
  Loader2Icon,
  ShieldIcon,
  Trash2Icon,
} from 'lucide-react'
import { Suspense } from 'react'
import { toast } from 'sonner'
import {
  getGetWorkspaceMembersQueryKey,
  useAssignRoleToMember,
  useGetWorkspaceMembersSuspense,
  useRemoveMember,
} from '@/api/members/members'
import { useGetRolesSuspense } from '@/api/roles/roles'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useWorkspacePermissions } from '@/hooks/use-workspace-permissions'
import { cn } from '@/lib/utils'

export function MembersSection({ workspaceId }: { workspaceId: string }) {
  return (
    <Suspense fallback={<MembersSectionSkeleton />}>
      <MembersSectionLoader workspaceId={workspaceId} />
    </Suspense>
  )
}

function MembersSectionLoader({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient()
  const { data: membersRes } = useGetWorkspaceMembersSuspense(workspaceId)
  const members = membersRes.status === 200 ? membersRes.data.members : []

  const { data: rolesRes } = useGetRolesSuspense(workspaceId)
  const roles = rolesRes.status === 200 ? rolesRes.data.roles : []

  const { can } = useWorkspacePermissions(workspaceId)
  const canUpdate = can('member', 'update')
  const canDelete = can('member', 'delete')

  const assignRoleMutation = useAssignRoleToMember()
  const removeMemberMutation = useRemoveMember()

  function handleAssignRole(
    memberId: string,
    roleId: string,
    roleName: string,
  ) {
    assignRoleMutation.mutate(
      { workspaceId, memberId, data: { roleId } },
      {
        onSuccess: (res) => {
          if (res.status === 204) {
            queryClient.invalidateQueries({
              queryKey: getGetWorkspaceMembersQueryKey(workspaceId),
            })
            toast.success(`Role changed to "${roleName}"`)
          } else {
            toast.error('Failed to change role')
          }
        },
        onError: () => toast.error('Failed to change role'),
      },
    )
  }

  function handleRemoveMember(memberId: string, memberName: string) {
    removeMemberMutation.mutate(
      { workspaceId, memberId },
      {
        onSuccess: (res) => {
          if (res.status === 204) {
            queryClient.invalidateQueries({
              queryKey: getGetWorkspaceMembersQueryKey(workspaceId),
            })
            toast.success(`"${memberName}" removed`)
          } else if (res.status === 403) {
            toast.error('Cannot remove the workspace owner')
          } else {
            toast.error('Failed to remove member')
          }
        },
        onError: () => toast.error('Failed to remove member'),
      },
    )
  }

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
              {members.map((member, i) => {
                const isUpdating =
                  assignRoleMutation.isPending &&
                  assignRoleMutation.variables?.memberId === member.id

                const isRemoving =
                  removeMemberMutation.isPending &&
                  removeMemberMutation.variables?.memberId === member.id

                return (
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

                    {canUpdate ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={isUpdating}
                          className='flex items-center gap-1.5 shrink-0 px-2 py-1 border border-primary/50 bg-primary/5 text-primary outline-none transition-colors cursor-pointer hover:bg-primary/10 disabled:opacity-60 disabled:cursor-not-allowed data-[state=open]:bg-primary/10'
                        >
                          {isUpdating ? (
                            <Loader2Icon className='size-3 shrink-0 animate-spin' />
                          ) : (
                            <ShieldIcon className='size-3 shrink-0' />
                          )}
                          <span className='font-mono text-xs font-semibold uppercase tracking-wide'>
                            {member.roleName}
                          </span>
                          <ChevronDownIcon className='size-3 shrink-0' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='min-w-44'>
                          <DropdownMenuLabel>Assign role</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <ScrollArea type='always'>
                            <div className='max-h-120'>
                              {roles.map((role) => (
                                <DropdownMenuCheckboxItem
                                  key={role.id}
                                  checked={role.id === member.roleId}
                                  disabled={role.id === member.roleId}
                                  onSelect={() =>
                                    handleAssignRole(
                                      member.id,
                                      role.id,
                                      role.name,
                                    )
                                  }
                                >
                                  {role.name}
                                </DropdownMenuCheckboxItem>
                              ))}
                            </div>
                          </ScrollArea>
                          {roles.length === 0 && (
                            <p className='px-2.5 py-2 font-mono text-xs text-muted-foreground'>
                              No roles available
                            </p>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className='flex items-center gap-1.5 shrink-0 px-2 py-1 border border-primary/50 bg-primary/5 text-primary'>
                        <ShieldIcon className='size-3 shrink-0' />
                        <span className='font-mono text-xs font-semibold uppercase tracking-wide'>
                          {member.roleName}
                        </span>
                      </div>
                    )}

                    {canDelete && (
                      <button
                        type='button'
                        aria-label={`Remove ${member.name}`}
                        disabled={isRemoving}
                        onClick={() =>
                          handleRemoveMember(member.id, member.name)
                        }
                        className='flex items-center justify-center shrink-0 size-7 border border-destructive/40 text-destructive outline-none transition-colors cursor-pointer hover:bg-destructive/10 disabled:opacity-60 disabled:cursor-not-allowed'
                      >
                        {isRemoving ? (
                          <Loader2Icon className='size-3.5 animate-spin' />
                        ) : (
                          <Trash2Icon className='size-3.5' />
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

export function MembersSectionSkeleton() {
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
