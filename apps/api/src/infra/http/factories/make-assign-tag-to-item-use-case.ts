import { AssignTagToItemUseCase } from '@/domain/root/application/use-cases/assign-tag-to-item.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleItemRepository } from '@/infra/db/drizzle/repositories/item-repository.ts'
import { DrizzleTagRepository } from '@/infra/db/drizzle/repositories/tag-repository.ts'

export function makeAssignTagToItemUseCase() {
  const itemRepository = new DrizzleItemRepository(db)
  const tagRepository = new DrizzleTagRepository(db)
  return new AssignTagToItemUseCase(itemRepository, tagRepository)
}
