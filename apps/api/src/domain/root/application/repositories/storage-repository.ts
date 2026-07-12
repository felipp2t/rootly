export interface UploadStorageRepositoryParams {
  fileName: string
  fileBuffer: Buffer
  mimeType: string
}

export abstract class StorageRepository {
  abstract upload(
    params: UploadStorageRepositoryParams,
  ): Promise<{ key: string }>
  abstract delete(key: string): Promise<void>
}
