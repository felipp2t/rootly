import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { UserRepository } from '@/domain/root/application/repositories/user-repository.ts'
import {
  type ActivityAction,
  ActivityLog,
  type ActivityLogMetadata,
  type ActivityResourceType,
} from '../../enterprise/entities/activity-log.ts'
import type { ActivityLogRepository } from '../repositories/activity-log-repository.ts'
import { ActivityActorNotFoundError } from './errors/activity-actor-not-found-error.ts'

interface RecordActivityLogUseCaseRequest {
  workspaceId: string
  resourceType: ActivityResourceType
  resourceId: string
  resourceName: string
  action: ActivityAction
  actorUserId: string
  metadata?: ActivityLogMetadata
}

type RecordActivityLogUseCaseResponse = Either<
  BaseError,
  { activityLog: ActivityLog }
>

export class RecordActivityLogUseCase {
  constructor(
    private readonly activityLogRepository: ActivityLogRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    workspaceId,
    resourceType,
    resourceId,
    resourceName,
    action,
    actorUserId,
    metadata,
  }: RecordActivityLogUseCaseRequest): Promise<RecordActivityLogUseCaseResponse> {
    const actor = await this.userRepository.findById(actorUserId)

    if (!actor) {
      return left(new ActivityActorNotFoundError())
    }

    const activityLog = ActivityLog.create({
      workspaceId,
      resourceType,
      resourceId,
      resourceName,
      action,
      actorUserId,
      actorName: actor.name,
      metadata,
    })

    await this.activityLogRepository.create(activityLog)

    return right({ activityLog })
  }
}
