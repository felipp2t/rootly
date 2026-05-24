import { CreateItemUseCase } from '@/domain/root/application/use-cases/create-item.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { env } from '@/infra/env/index.ts'
import { minioClient } from '@/infra/storage/minio/minio.ts'
import { MinioStorageRepository } from '@/infra/storage/minio/repositories/minio-storage-repository.ts'
import { DrizzleItemRepository } from '@/infra/db/drizzle/repositories/item-repository.ts'

export function makeCreateItemUseCase() {
  const itemRepository = new DrizzleItemRepository(db)
  const storageRepository = new MinioStorageRepository(minioClient, env.MINIO_BUCKET)
  const useCase = new CreateItemUseCase(itemRepository, storageRepository)
  return useCase
}
