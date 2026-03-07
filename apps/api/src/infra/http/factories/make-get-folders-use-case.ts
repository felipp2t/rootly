import { GetFoldersUseCase } from '@/domain/root/application/use-cases/get-folders.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleFolderRepository } from '@/infra/db/drizzle/repositories/folder-repository.ts'

export function makeGetFoldersUseCase() {
  const folderRepository = new DrizzleFolderRepository(db)
  return new GetFoldersUseCase(folderRepository)
}
