import type { WorkspaceRoleRepository } from '@/domain/root/application/repositories/workspace-role-repository.ts'
import type { WorkspaceRole } from '@/domain/root/enterprise/entities/workspace-role.ts'
import { eq } from 'drizzle-orm'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleWorkspaceRoleMapper } from '../mappers/drizzle-workspace-role-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleWorkspaceRoleRepository implements WorkspaceRoleRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: string): Promise<WorkspaceRole | null> {
    const workspaceRoles = await this.db
      .select()
      .from(schema.workspaceRoles)
      .where(eq(schema.workspaceRoles.id, id))

    if (workspaceRoles.length === 0) {
      return null
    }

    return DrizzleWorkspaceRoleMapper.toDomain(workspaceRoles[0])
  }

  async findByWorkspaceId(workspaceId: string): Promise<WorkspaceRole | null> {
    const workspacesRoles = await this.db
      .select()
      .from(schema.workspaceRoles)
      .where(eq(schema.workspaceRoles.id, workspaceId))

    if (workspacesRoles.length === 0) {
      return null
    }

    return DrizzleWorkspaceRoleMapper.toDomain(workspacesRoles[0])
  }

  async findMany(name?: string): Promise<WorkspaceRole[]> {
    const rows = await this.db
      .select()
      .from(schema.workspaceRoles)
      .where(
        name !== undefined ? eq(schema.workspaceRoles.name, name) : undefined,
      )

    if (rows.length === 0) return []

    return rows.map((row) => DrizzleWorkspaceRoleMapper.toDomain(row))
  }

  async create(workspaceRole: WorkspaceRole): Promise<void> {
    await this.db
      .insert(schema.workspaceRoles)
      .values(DrizzleWorkspaceRoleMapper.toDrizzle(workspaceRole))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.workspaceRoles).where(eq(schema.workspaceRoles.id, id))
  }
}
