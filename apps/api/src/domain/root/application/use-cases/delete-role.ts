import type { BaseError } from '@/core/errors/base-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import type { WorkspaceRoleRepository } from '../repositories/workspace-role-repository.ts'

interface DeleteRoleUseCaseRequest {
  userId: string
  workspaceId: string
  roleId: string
}

type DeleteRoleUseCaseResponse = Either<BaseError, null>

export class DeleteRoleUseCase {
  constructor(
    private readonly workspaceRoleRepository: WorkspaceRoleRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
    roleId,
  }: DeleteRoleUseCaseRequest): Promise<DeleteRoleUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(userId, workspaceId)

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    const role = await this.workspaceRoleRepository.findById(roleId)

    if (!role || role.workspaceId !== workspaceId) {
      return left(new ResourceNotFoundError('Role'))
    }

    await this.workspaceRoleRepository.delete(roleId)

    return right(null)
  }
}
