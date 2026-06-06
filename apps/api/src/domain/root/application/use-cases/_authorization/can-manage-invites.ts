import type { RolePermissionRepository } from '../../repositories/role-permission-repository.ts'
import type { WorkspaceMemberRepository } from '../../repositories/workspace-member-repository.ts'

interface CanManageInvitesParams {
  userId: string
  workspaceId: string
  ownerId: string
}

/**
 * Resolves whether a user may manage invites in a workspace: the owner always
 * can; otherwise the user's role must grant `member:invite` (or `member:all`).
 */
export async function canManageInvites(
  { userId, workspaceId, ownerId }: CanManageInvitesParams,
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
      p.resource === 'member' && (p.action === 'invite' || p.action === 'all'),
  )
}
