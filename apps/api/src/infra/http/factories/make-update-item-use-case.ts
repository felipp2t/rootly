import { UpdateItemUseCase } from '@/domain/root/application/use-cases/update-item.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleItemRepository } from '@/infra/db/drizzle/repositories/item-repository.ts'

export function makeUpdateItemUseCase() {
  const itemRepository = new DrizzleItemRepository(db)
  return new UpdateItemUseCase(itemRepository)
}
