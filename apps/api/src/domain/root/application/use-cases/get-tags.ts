import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, right } from '@/core/types/either.ts'
import type { Tag } from '../../enterprise/entities/tag.ts'
import type { TagRepository } from '../repositories/tag-repository.ts'

interface GetTagsUseCaseRequest {
  workspaceId: string
}

type GetTagsUseCaseResponse = Either<BaseError, { tags: Tag[] }>

export class GetTagsUseCase {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute({
    workspaceId,
  }: GetTagsUseCaseRequest): Promise<GetTagsUseCaseResponse> {
    const tags = await this.tagRepository.findManyByWorkspaceId(workspaceId)
    return right({ tags })
  }
}
