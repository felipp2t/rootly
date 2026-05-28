import { ResolveFolderPathUseCase } from '@/domain/root/application/use-cases/resolve-folder-path.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleFolderRepository } from '@/infra/db/drizzle/repositories/folder-repository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'

export function makeResolveFolderPathUseCase() {
  const folderRepository = new DrizzleFolderRepository(db)
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  return new ResolveFolderPathUseCase(folderRepository, workspaceRepository)
}
