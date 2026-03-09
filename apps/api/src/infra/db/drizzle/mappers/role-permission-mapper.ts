import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { RolePermission } from '@/domain/root/enterprise/entities/role-permission.ts'
import type { schema } from '../schema/index.ts'

type DrizzleRolePermission = InferSelectModel<typeof schema.rolePermissions>
type DrizzleRolePermissionInsert = InferInsertModel<
  typeof schema.rolePermissions
>

export class DrizzleRolePermissionMapper {
  static toDomain(raw: DrizzleRolePermission): RolePermission {
    return RolePermission.create(
      {
        action: raw.action,
        resource: raw.resource,
        roleId: raw.roleId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? undefined,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toDrizzle(
    rolePermission: RolePermission,
  ): DrizzleRolePermissionInsert {
    return {
      id: rolePermission.id.toString(),
      action: rolePermission.action,
      resource: rolePermission.resource,
      roleId: rolePermission.roleId,
      createdAt: rolePermission.createdAt,
      updatedAt: rolePermission.updatedAt ?? null,
    }
  }
}
