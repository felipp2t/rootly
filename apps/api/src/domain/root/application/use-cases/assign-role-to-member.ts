import type { BaseError } from '@/core/errors/base-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { WorkspaceMemberRepository } from '../repositories/workspace-member-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import type { WorkspaceRoleRepository } from '../repositories/workspace-role-repository.ts'

interface AssignRoleToMemberUseCaseRequest {
  userId: string
  workspaceId: string
  memberId: string
  roleId: string
}

type AssignRoleToMemberUseCaseResponse = Either<BaseError, null>

export class AssignRoleToMemberUseCase {
  constructor(
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceRoleRepository: WorkspaceRoleRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
    memberId,
    roleId,
  }: AssignRoleToMemberUseCaseRequest): Promise<AssignRoleToMemberUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(
      userId,
      workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    const member = await this.workspaceMemberRepository.findById(memberId)

    if (!member || member.workspaceId !== workspaceId) {
      return left(new ResourceNotFoundError('Member'))
    }

    const role = await this.workspaceRoleRepository.findById(roleId)

    if (!role || role.workspaceId !== workspaceId) {
      return left(new ResourceNotFoundError('Role'))
    }

    member.changeRole(roleId, userId)

    await this.workspaceMemberRepository.save(member)

    return right(null)
  }
}
