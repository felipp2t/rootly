import { AssignTagToFolderUseCase } from '@/domain/root/application/use-cases/assign-tag-to-folder.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleFolderRepository } from '@/infra/db/drizzle/repositories/folder-repository.ts'
import { DrizzleTagRepository } from '@/infra/db/drizzle/repositories/tag-repository.ts'

export function makeAssignTagToFolderUseCase() {
  const folderRepository = new DrizzleFolderRepository(db)
  const tagRepository = new DrizzleTagRepository(db)
  return new AssignTagToFolderUseCase(folderRepository, tagRepository)
}
