import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import { Tag, type TagProps } from '../../enterprise/entities/tag.ts'
import type { TagRepository } from '../repositories/tag-repository.ts'
import { TagAlreadyExistsError } from './errors/tag-already-exists-error.ts'

interface CreateTagUseCaseRequest {
  name: string
  color: TagProps['color']
  workspaceId: string
}

type CreateTagUseCaseResponse = Either<BaseError, { tagId: string }>

export class CreateTagUseCase {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute({
    name,
    color,
    workspaceId,
  }: CreateTagUseCaseRequest): Promise<CreateTagUseCaseResponse> {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const existing = await this.tagRepository.findBySlug(slug, workspaceId)

    if (existing) {
      return left(new TagAlreadyExistsError())
    }

    const tag = Tag.create({ name, slug, color, workspaceId })

    await this.tagRepository.create(tag)

    return right({ tagId: tag.id.toString() })
  }
}
