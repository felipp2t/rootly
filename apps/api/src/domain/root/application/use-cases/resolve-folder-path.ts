import type { BaseError } from '@/core/errors/base-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { FolderRepository } from '../repositories/folder-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import { InvalidFolderPathError } from './errors/invalid-folder-path-error.ts'

interface ResolveFolderPathUseCaseRequest {
  userId: string
  workspaceId: string
  pathIds: string[]
}

type ResolvedFolder = { id: string; name: string }

type ResolveFolderPathUseCaseResponse = Either<
  BaseError,
  { path: ResolvedFolder[] }
>

export class ResolveFolderPathUseCase {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
    pathIds,
  }: ResolveFolderPathUseCaseRequest): Promise<ResolveFolderPathUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(
      userId,
      workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    if (pathIds.length === 0) {
      return right({ path: [] })
    }

    const folders = await this.folderRepository.findManyByIds(pathIds)

    if (folders.length !== pathIds.length) {
      return left(new InvalidFolderPathError())
    }

    const foldersById = new Map(folders.map((f) => [f.id.toString(), f]))
    const ordered = pathIds.map((id) => foldersById.get(id))

    if (ordered.some((f) => !f)) {
      return left(new InvalidFolderPathError())
    }

    const resolved = ordered as NonNullable<(typeof ordered)[number]>[]

    for (let i = 0; i < resolved.length; i++) {
      const folder = resolved[i]

      if (folder.workspaceId !== workspaceId) {
        return left(new InvalidFolderPathError())
      }

      const expectedParentId =
        i === 0 ? undefined : resolved[i - 1].id.toString()

      if (folder.parentId !== expectedParentId) {
        return left(new InvalidFolderPathError())
      }
    }

    return right({
      path: resolved.map((f) => ({ id: f.id.toString(), name: f.name })),
    })
  }
}
