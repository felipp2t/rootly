import { eq, inArray } from 'drizzle-orm'
import { DomainEvents } from '@/core/events/domain-events.ts'
import type { WorkspaceInviteRepository } from '@/domain/root/application/repositories/workspace-invite-repository.ts'
import type {
  WorkspaceInvite,
  WorkspaceInviteStatus,
} from '@/domain/root/enterprise/entities/workspace-invite.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleWorkspaceInviteMapper } from '../mappers/drizzle-workspace-invite-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleWorkspaceInviteRepository
  implements WorkspaceInviteRepository
{
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: string): Promise<WorkspaceInvite | null> {
    const workspacesInvite = await this.db
      .select()
      .from(schema.workspaceInvites)
      .where(eq(schema.workspaceInvites.id, id))

    if (workspacesInvite.length === 0) {
      return null
    }

    return DrizzleWorkspaceInviteMapper.toDomain(workspacesInvite[0])
  }

  async findMany(
    statuses?: WorkspaceInviteStatus[],
  ): Promise<WorkspaceInvite[]> {
    const workspaceInvites = await this.db
      .select()
      .from(schema.workspaceInvites)
      .where(
        statuses && statuses.length > 0
          ? inArray(schema.workspaceInvites.status, statuses)
          : undefined,
      )

    return workspaceInvites.map(DrizzleWorkspaceInviteMapper.toDomain)
  }

  async create(workspaceInvite: WorkspaceInvite): Promise<void> {
    await this.db
      .insert(schema.workspaceInvites)
      .values(DrizzleWorkspaceInviteMapper.toDrizzle(workspaceInvite))

    DomainEvents.dispatchEventsForAggregate(workspaceInvite.id)
  }

  async revoke(id: string): Promise<void> {
    await this.db
      .update(schema.workspaceInvites)
      .set({ status: 'revoked' })
      .where(eq(schema.workspaceInvites.id, id))
  }
}
