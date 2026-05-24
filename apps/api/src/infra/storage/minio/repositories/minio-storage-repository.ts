import type { Client } from 'minio'
import { nanoid } from 'nanoid'
import type {
  StorageRepository,
  UploadStorageRepositoryParams,
} from '@/domain/root/application/repositories/storage-repository.ts'

export class MinioStorageRepository implements StorageRepository {
  constructor(
    private readonly client: Client,
    private readonly bucket: string,
  ) {}

  async upload({
    fileName,
    fileBuffer,
    mimeType,
  }: UploadStorageRepositoryParams): Promise<{ key: string }> {
    const key = `${nanoid()}-${fileName}`
    await this.client.putObject(
      this.bucket,
      key,
      fileBuffer,
      fileBuffer.length,
      {
        'Content-Type': mimeType,
      },
    )
    return { key }
  }

  async delete(key: string) {
    await this.client.removeObject(this.bucket, key)
  }
}
