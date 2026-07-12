import { DeleteFolderUseCase } from '@/domain/root/application/use-cases/delete-folder.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleFolderRepository } from '@/infra/db/drizzle/repositories/folder-repository.ts'
import { DrizzleItemRepository } from '@/infra/db/drizzle/repositories/item-repository.ts'

export function makeDeleteFolderUseCase() {
  const folderRepository = new DrizzleFolderRepository(db)
  const itemRepository = new DrizzleItemRepository(db)
  return new DeleteFolderUseCase(folderRepository, itemRepository)
}
