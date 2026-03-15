import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { Workspace } from '@/domain/root/enterprise/entities/workspace.ts'
import type { schema } from '../schema/index.ts'

type DrizzleWorkspace = InferSelectModel<typeof schema.workspaces>
type DrizzleWorkspaceInsert = InferInsertModel<typeof schema.workspaces>

export class DrizzleWorkspaceMapper {
  static toDomain(raw: DrizzleWorkspace, itemCount = 0): Workspace {
    return Workspace.create(
      {
        name: raw.name,
        userId: raw.userId,
        itemCount,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? undefined,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toDrizzle(workspace: Workspace): DrizzleWorkspaceInsert {
    return {
      id: workspace.id.toString(),
      userId: workspace.userId,
      name: workspace.name,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt ?? null,
    }
  }
}
