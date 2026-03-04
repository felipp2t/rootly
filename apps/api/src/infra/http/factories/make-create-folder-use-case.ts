import { CreateFolderUseCase } from '@/domain/root/application/use-cases/create-folder.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleFolderRepository } from '@/infra/db/drizzle/repositories/folder-repository.ts'

export function makeCreateFolderUseCase() {
  const folderRepository = new DrizzleFolderRepository(db)

  const useCase = new CreateFolderUseCase(folderRepository)

  return useCase
}
