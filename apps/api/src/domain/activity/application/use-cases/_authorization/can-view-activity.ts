import type { RolePermissionRepository } from '@/domain/root/application/repositories/role-permission-repository.ts'
import type { WorkspaceMemberRepository } from '@/domain/root/application/repositories/workspace-member-repository.ts'

interface CanViewActivityParams {
  userId: string
  workspaceId: string
  ownerId: string
}

/**
 * Resolves whether a user may view a workspace's activity log: the owner
 * always can; otherwise the user's role must grant `activity:read` (or
 * `activity:all`).
 */
export async function canViewActivity(
  { userId, workspaceId, ownerId }: CanViewActivityParams,
  workspaceMemberRepository: WorkspaceMemberRepository,
  rolePermissionRepository: RolePermissionRepository,
): Promise<boolean> {
  if (ownerId === userId) {
    return true
  }

  const member = await workspaceMemberRepository.findByUserIdAndWorkspaceId(
    userId,
    workspaceId,
  )

  if (!member) {
    return false
  }

  const permissions = await rolePermissionRepository.findByRoleId(member.roleId)

  return permissions.some(
    (p) =>
      p.resource === 'activity' && (p.action === 'read' || p.action === 'all'),
  )
}
