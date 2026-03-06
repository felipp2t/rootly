import { eq } from 'drizzle-orm'
import type { WorkspaceRepository } from '@/domain/root/application/repositories/workspace-repository.ts'
import type { Workspace } from '@/domain/root/enterprise/entities/workspace.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleWorkspaceMapper } from '../mappers/drizzle-workspace-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: string): Promise<Workspace | null> {
    const workspaces = await this.db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, id))

    if (workspaces.length === 0) {
      return null
    }

    return DrizzleWorkspaceMapper.toDomain(workspaces[0])
  }

  async findByName(name: string): Promise<Workspace | null> {
    const workspaces = await this.db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.name, name))

    if (workspaces.length === 0) {
      return null
    }

    return DrizzleWorkspaceMapper.toDomain(workspaces[0])
  }

  async findAll(): Promise<Workspace[]> {
    const workspaces = await this.db.select().from(schema.workspaces)

    return workspaces.map(DrizzleWorkspaceMapper.toDomain)
  }

  async create(workspace: Workspace): Promise<void> {
    await this.db
      .insert(schema.workspaces)
      .values(DrizzleWorkspaceMapper.toDrizzle(workspace))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.workspaces).where(eq(schema.workspaces.id, id))
  }
}
