import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { WorkspaceMember } from '@/domain/root/enterprise/entities/workspace-member.ts'
import type { schema } from '../schema/index.ts'

type DrizzleWorkspaceMember = InferSelectModel<typeof schema.workspaceMembers>
type DrizzleWorkspaceMemberInsert = InferInsertModel<
  typeof schema.workspaceMembers
>

export class DrizzleWorkspaceMemberMapper {
  static toDomain(raw: DrizzleWorkspaceMember): WorkspaceMember {
    return WorkspaceMember.create(
      {
        userId: raw.userId,
        workspaceId: raw.workspaceId,
        roleId: raw.roleId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? undefined,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toDrizzle(member: WorkspaceMember): DrizzleWorkspaceMemberInsert {
    return {
      id: member.id.toString(),
      userId: member.userId,
      workspaceId: member.workspaceId,
      roleId: member.roleId,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    }
  }
}
