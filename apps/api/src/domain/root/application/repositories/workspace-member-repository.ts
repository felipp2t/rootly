import type { WorkspaceMember } from '../../enterprise/entities/workspace-member.ts'

export abstract class WorkspaceMemberRepository {
  abstract findById(id: string): Promise<WorkspaceMember | null>
  abstract findByUserId(userId: string): Promise<WorkspaceMember[]>
  abstract create(member: WorkspaceMember): Promise<void>
  abstract delete(id: string): Promise<void>
}
