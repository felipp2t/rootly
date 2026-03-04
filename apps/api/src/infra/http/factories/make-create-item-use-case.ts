import { CreateItemUseCase } from '@/domain/root/application/use-cases/create-item.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleItemRepository } from '@/infra/db/drizzle/repositories/item-repository.ts'

export function makeCreateItemUseCase() {
  const itemRepository = new DrizzleItemRepository(db)
  const useCase = new CreateItemUseCase(itemRepository)
  return useCase
}
