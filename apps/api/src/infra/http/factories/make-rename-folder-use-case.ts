import { RenameFolderUseCase } from '@/domain/root/application/use-cases/rename-folder.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleFolderRepository } from '@/infra/db/drizzle/repositories/folder-repository.ts'

export function makeRenameFolderUseCase() {
  const folderRepository = new DrizzleFolderRepository(db)
  return new RenameFolderUseCase(folderRepository)
}
