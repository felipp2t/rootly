import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { WorkspaceRole } from '@/domain/root/enterprise/entities/workspace-role.ts'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '../schema/index.ts'

type DrizzleWorkspaceRole = InferSelectModel<typeof schema.workspaceRoles>
type DrizzleWorkspaceRoleInsert = InferInsertModel<typeof schema.workspaceRoles>

export class DrizzleWorkspaceRoleMapper {
  static toDomain(raw: DrizzleWorkspaceRole): WorkspaceRole {
    return WorkspaceRole.create(
      {
        workspaceId: raw.workspaceId,
        name: raw.name,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? undefined,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toDrizzle(workspace: WorkspaceRole): DrizzleWorkspaceRoleInsert {
    return {
      id: workspace.id.toString(),
      workspaceId: workspace.workspaceId,
      name: workspace.name,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt ?? null,
    }
  }
}
