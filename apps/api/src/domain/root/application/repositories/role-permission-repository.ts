import type { RolePermission } from '../../enterprise/entities/role-permission.ts'

export abstract class RolePermissionRepository {
  abstract findById(id: string): Promise<RolePermission | null>
  abstract findByRoleId(roleId: string): Promise<RolePermission[]>
  abstract create(rolePermission: RolePermission): Promise<void>
  abstract delete(id: string): Promise<void>
}
