import { GetItemsUseCase } from '@/domain/root/application/use-cases/get-items.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleItemRepository } from '@/infra/db/drizzle/repositories/item-repository.ts'

export function makeGetItemsUseCase() {
  const itemRepository = new DrizzleItemRepository(db)
  return new GetItemsUseCase(itemRepository)
}
