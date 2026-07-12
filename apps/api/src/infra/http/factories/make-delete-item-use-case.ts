import { DeleteItemUseCase } from '@/domain/root/application/use-cases/delete-item.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleItemRepository } from '@/infra/db/drizzle/repositories/item-repository.ts'
import { env } from '@/infra/env/index.ts'
import { minioClient } from '@/infra/storage/minio/minio.ts'
import { MinioStorageRepository } from '@/infra/storage/minio/repositories/minio-storage-repository.ts'

export function makeDeleteItemUseCase() {
  const itemRepository = new DrizzleItemRepository(db)
  const storageRepository = new MinioStorageRepository(
    minioClient,
    env.MINIO_BUCKET,
  )
  return new DeleteItemUseCase(itemRepository, storageRepository)
}
