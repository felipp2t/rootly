import type { RolePermissionRepository } from '@/domain/root/application/repositories/role-permission-repository.ts'
import type { RolePermission } from '@/domain/root/enterprise/entities/role-permission.ts'

export class InMemoryRolePermissionRepository
  implements RolePermissionRepository
{
  items: RolePermission[] = []

  async findById(id: string): Promise<RolePermission | null> {
    return (
      this.items.find((workspace) => workspace.id.toString() === id) ?? null
    )
  }

  async findByRoleId(roleId: string): Promise<RolePermission[]> {
    return this.items.filter(
      (rolePermission) => rolePermission.roleId === roleId,
    )
  }

  async create(rolePemission: RolePermission): Promise<void> {
    this.items.push(rolePemission)
  }

  async delete(id: string): Promise<void> {
    const rolePermissionIndex = this.items.findIndex(
      (rolePermission) => rolePermission.id.toString() === id,
    )

    if (rolePermissionIndex !== -1) {
      this.items.splice(rolePermissionIndex, 1)
    }
  }
}
