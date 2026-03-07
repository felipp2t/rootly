import { type Either, right } from '@/core/types/either.ts'
import { Workspace } from '../../enterprise/entities/workspace.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'

interface CreateWorkspaceUseCaseRequest {
  name: string
  userId: string
}

type CreateWorkspaceUseCaseResponse = Either<undefined, { workspaceId: string }>

export class CreateWorkspaceUseCase {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({
    name,
    userId,
  }: CreateWorkspaceUseCaseRequest): Promise<CreateWorkspaceUseCaseResponse> {
    const workspace = Workspace.create({
      name,
      userId,
    })

    await this.workspaceRepository.create(workspace)

    return right({ workspaceId: workspace.id.toString() })
  }
}
