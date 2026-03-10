import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { WithRequired } from '@/core/types/with-required.ts'
import {
  WorkspaceInvite,
  type WorkspaceInviteProps,
} from '@/domain/root/enterprise/entities/workspace-invite.ts'

export function makeWorkspaceInvite(
  override: WithRequired<
    Partial<WorkspaceInviteProps>,
    'workspaceId' | 'invitedUserId' | 'invitedByUserId' | 'roleId'
  >,
  id?: UniqueEntityID,
) {
  return WorkspaceInvite.create(
    {
      ...override,
    },
    id,
  )
}
