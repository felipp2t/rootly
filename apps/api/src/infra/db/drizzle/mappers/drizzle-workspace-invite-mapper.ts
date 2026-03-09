import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { WorkspaceInvite } from '@/domain/root/enterprise/entities/workspace-invite.ts'
import type { schema } from '../schema/index.ts'

type DrizzleWorkspaceInvite = InferSelectModel<typeof schema.workspaceInvites>
type DrizzleWorkspaceInviteInsert = InferInsertModel<
  typeof schema.workspaceInvites
>

export class DrizzleWorkspaceInviteMapper {
  static toDomain(raw: DrizzleWorkspaceInvite): WorkspaceInvite {
    return WorkspaceInvite.create(
      {
        invitedByUserId: raw.invitedByUserId,
        invitedUserId: raw.invitedUserId,
        workspaceId: raw.workspaceId,
        roleId: raw.roleId,
        status: raw.status,
        expiresAt: raw.expiresAt,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? undefined,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toDrizzle(
    workspaceInvite: WorkspaceInvite,
  ): DrizzleWorkspaceInviteInsert {
    return {
      id: workspaceInvite.id.toString(),
      invitedByUserId: workspaceInvite.invitedByUserId,
      invitedUserId: workspaceInvite.invitedUserId,
      workspaceId: workspaceInvite.workspaceId,
      roleId: workspaceInvite.roleId,
      status: workspaceInvite.status,
      expiresAt: workspaceInvite.expiresAt,
      createdAt: workspaceInvite.createdAt,
      updatedAt: workspaceInvite.updatedAt ?? null,
    }
  }
}
