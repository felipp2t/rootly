import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { WithRequired } from '@/core/types/with-required.ts'
import {
  WorkspaceMember,
  type WorkspaceMemberProps,
} from '@/domain/root/enterprise/entities/workspace-member.ts'

export function makeWorkspaceMember(
  override: WithRequired<
    Partial<WorkspaceMemberProps>,
    'userId' | 'workspaceId' | 'roleId'
  >,
  id?: UniqueEntityID,
) {
  return WorkspaceMember.create(
    {
      ...override,
    },
    id,
  )
}
