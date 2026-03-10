import { eq } from 'drizzle-orm'
import { DomainEvents } from '@/core/events/domain-events.ts'
import type { WorkspaceMemberRepository } from '@/domain/root/application/repositories/workspace-member-repository.ts'
import type { WorkspaceMember } from '@/domain/root/enterprise/entities/workspace-member.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleWorkspaceMemberMapper } from '../mappers/drizzle-workspace-member-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleWorkspaceMemberRepository
  implements WorkspaceMemberRepository
{
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: string): Promise<WorkspaceMember | null> {
    const rows = await this.db
      .select()
      .from(schema.workspaceMembers)
      .where(eq(schema.workspaceMembers.id, id))

    if (rows.length === 0) return null

    return DrizzleWorkspaceMemberMapper.toDomain(rows[0])
  }

  async findByUserId(userId: string): Promise<WorkspaceMember[]> {
    const rows = await this.db
      .select()
      .from(schema.workspaceMembers)
      .where(eq(schema.workspaceMembers.userId, userId))

    return rows.map(DrizzleWorkspaceMemberMapper.toDomain)
  }

  async create(member: WorkspaceMember): Promise<void> {
    await this.db
      .insert(schema.workspaceMembers)
      .values(DrizzleWorkspaceMemberMapper.toDrizzle(member))

    DomainEvents.dispatchEventsForAggregate(member.id)
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(schema.workspaceMembers)
      .where(eq(schema.workspaceMembers.id, id))
  }
}
