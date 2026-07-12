import { RestoreItemUseCase } from '@/domain/root/application/use-cases/restore-item.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleItemRepository } from '@/infra/db/drizzle/repositories/item-repository.ts'

export function makeRestoreItemUseCase() {
  const itemRepository = new DrizzleItemRepository(db)
  return new RestoreItemUseCase(itemRepository)
}
