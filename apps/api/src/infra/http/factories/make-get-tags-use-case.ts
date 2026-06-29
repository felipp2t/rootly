import { GetTagsUseCase } from '@/domain/root/application/use-cases/get-tags.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleTagRepository } from '@/infra/db/drizzle/repositories/tag-repository.ts'

export function makeGetTagsUseCase() {
  const tagRepository = new DrizzleTagRepository(db)
  return new GetTagsUseCase(tagRepository)
}
