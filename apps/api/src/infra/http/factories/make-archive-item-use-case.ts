import { ArchiveItemUseCase } from '@/domain/root/application/use-cases/archive-item.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleItemRepository } from '@/infra/db/drizzle/repositories/item-repository.ts'

export function makeArchiveItemUseCase() {
  const itemRepository = new DrizzleItemRepository(db)
  return new ArchiveItemUseCase(itemRepository)
}
