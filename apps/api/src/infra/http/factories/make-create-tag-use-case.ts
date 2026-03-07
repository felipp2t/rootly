import { CreateTagUseCase } from '@/domain/root/application/use-cases/create-tag.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleTagRepository } from '@/infra/db/drizzle/repositories/tag-repository.ts'

export function makeCreateTagUseCase() {
  const tagRepository = new DrizzleTagRepository(db)
  return new CreateTagUseCase(tagRepository)
}
