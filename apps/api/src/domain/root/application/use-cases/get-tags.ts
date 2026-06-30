import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, right } from '@/core/types/either.ts'
import type { Tag } from '../../enterprise/entities/tag.ts'
import type { TagRepository } from '../repositories/tag-repository.ts'

interface GetTagsUseCaseRequest {
  workspaceId: string
  cursor?: string
  limit?: number
}

type GetTagsUseCaseResponse = Either<BaseError, { tags: Tag[]; nextCursor?: string }>

export class GetTagsUseCase {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute({
    workspaceId,
    cursor,
    limit = 20,
  }: GetTagsUseCaseRequest): Promise<GetTagsUseCaseResponse> {
    const { tags, nextCursor } = await this.tagRepository.findManyByWorkspaceId(workspaceId, { cursor, limit })
    return right({ tags, nextCursor })
  }
}
