import { eq } from 'drizzle-orm'
import type { RolePermissionRepository } from '@/domain/root/application/repositories/role-permission-repository.ts'
import type { RolePermission } from '@/domain/root/enterprise/entities/role-permission.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleRolePermissionMapper } from '../mappers/role-permission-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleRolePermissionRepository
  implements RolePermissionRepository
{
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: string): Promise<RolePermission | null> {
    const rolePermissions = await this.db
      .select()
      .from(schema.rolePermissions)
      .where(eq(schema.rolePermissions.id, id))

    if (rolePermissions.length === 0) {
      return null
    }

    return DrizzleRolePermissionMapper.toDomain(rolePermissions[0])
  }

  async findByRoleId(roleId?: string): Promise<RolePermission[]> {
    const rows = await this.db
      .select()
      .from(schema.rolePermissions)
      .where(
        roleId !== undefined
          ? eq(schema.rolePermissions.roleId, roleId)
          : undefined,
      )

    if (rows.length === 0) return []

    return rows.map((row) => DrizzleRolePermissionMapper.toDomain(row))
  }

  async create(rolePermission: RolePermission): Promise<void> {
    await this.db
      .insert(schema.rolePermissions)
      .values(DrizzleRolePermissionMapper.toDrizzle(rolePermission))
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(schema.rolePermissions)
      .where(eq(schema.rolePermissions.id, id))
  }
}
