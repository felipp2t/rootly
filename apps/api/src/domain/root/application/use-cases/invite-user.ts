import type { BaseError } from '@/core/errors/base-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import { WorkspaceInvite } from '../../enterprise/entities/workspace-invite.ts'
import type { UserRepository } from '../repositories/user-repository.ts'
import type { WorkspaceInviteRepository } from '../repositories/workspace-invite-repository.ts'

interface InviteUserUseCaseRequest {
  email: string
  inviterId: string
  workspaceId: string
  roleId: string
}

type InviteUserUseCaseResponse = Either<
  BaseError,
  { workspaceInviteId: string }
>

export class InviteUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly workspaceInviteRepository: WorkspaceInviteRepository,
  ) {}

  async execute({
    email,
    inviterId,
    roleId,
    workspaceId,
  }: InviteUserUseCaseRequest): Promise<InviteUserUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    const workspaceInvite = WorkspaceInvite.create({
      invitedByUserId: inviterId,
      invitedUserId: user.id.toString(),
      roleId,
      workspaceId,
    })

    await this.workspaceInviteRepository.create(workspaceInvite)

    return right({
      workspaceInviteId: workspaceInvite.id.toString(),
    })
  }
}
