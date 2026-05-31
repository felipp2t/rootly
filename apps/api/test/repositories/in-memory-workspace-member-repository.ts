import type { WorkspaceMemberRepository } from '@/domain/root/application/repositories/workspace-member-repository.ts'
import type { WorkspaceMember } from '@/domain/root/enterprise/entities/workspace-member.ts'

export class InMemoryWorkspaceMemberRepository
  implements WorkspaceMemberRepository
{
  items: WorkspaceMember[] = []

  async findById(id: string): Promise<WorkspaceMember | null> {
    return this.items.find((member) => member.id.toString() === id) ?? null
  }

  async findByUserId(userId: string): Promise<WorkspaceMember[]> {
    return this.items.filter((member) => member.userId === userId)
  }

  async findByUserIdAndWorkspaceId(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceMember | null> {
    return (
      this.items.find(
        (member) =>
          member.userId === userId && member.workspaceId === workspaceId,
      ) ?? null
    )
  }

  async findByRoleId(roleId: string): Promise<WorkspaceMember[]> {
    return this.items.filter((member) => member.roleId === roleId)
  }

  async findManyByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.items.filter((member) => member.workspaceId === workspaceId)
  }

  async create(member: WorkspaceMember): Promise<void> {
    this.items.push(member)
  }

  async save(member: WorkspaceMember): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === member.id.toString(),
    )

    if (index !== -1) {
      this.items[index] = member
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((member) => member.id.toString() === id)

    if (index !== -1) {
      this.items.splice(index, 1)
    }
  }
}
