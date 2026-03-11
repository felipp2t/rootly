import { and, eq } from 'drizzle-orm'
import type { WorkspaceRoleRepository } from '@/domain/root/application/repositories/workspace-role-repository.ts'
import type { WorkspaceRole } from '@/domain/root/enterprise/entities/workspace-role.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleWorkspaceRoleMapper } from '../mappers/drizzle-workspace-role-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleWorkspaceRoleRepository implements WorkspaceRoleRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: string): Promise<WorkspaceRole | null> {
    const rows = await this.db
      .select()
      .from(schema.workspaceRoles)
      .where(eq(schema.workspaceRoles.id, id))

    if (rows.length === 0) return null

    return DrizzleWorkspaceRoleMapper.toDomain(rows[0])
  }

  async findByWorkspaceId(workspaceId: string): Promise<WorkspaceRole[]> {
    const rows = await this.db
      .select()
      .from(schema.workspaceRoles)
      .where(eq(schema.workspaceRoles.workspaceId, workspaceId))

    return rows.map(DrizzleWorkspaceRoleMapper.toDomain)
  }

  async findByWorkspaceIdAndName(
    workspaceId: string,
    name: string,
  ): Promise<WorkspaceRole | null> {
    const rows = await this.db
      .select()
      .from(schema.workspaceRoles)
      .where(
        and(
          eq(schema.workspaceRoles.workspaceId, workspaceId),
          eq(schema.workspaceRoles.name, name),
        ),
      )

    if (rows.length === 0) return null

    return DrizzleWorkspaceRoleMapper.toDomain(rows[0])
  }

  async findMany(name?: string): Promise<WorkspaceRole[]> {
    const rows = await this.db
      .select()
      .from(schema.workspaceRoles)
      .where(
        name !== undefined ? eq(schema.workspaceRoles.name, name) : undefined,
      )

    return rows.map(DrizzleWorkspaceRoleMapper.toDomain)
  }

  async create(workspaceRole: WorkspaceRole): Promise<void> {
    await this.db
      .insert(schema.workspaceRoles)
      .values(DrizzleWorkspaceRoleMapper.toDrizzle(workspaceRole))
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(schema.workspaceRoles)
      .where(eq(schema.workspaceRoles.id, id))
  }
}
