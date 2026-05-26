import type {
  StorageRepository,
  UploadStorageRepositoryParams,
} from '@/domain/root/application/repositories/storage-repository.ts'
import { Item } from '@/domain/root/enterprise/entities/item.ts'

export class InMemoryStorageRepository implements StorageRepository {
  items: Item[] = []
  uploads: UploadStorageRepositoryParams[] = []

  async upload(params: UploadStorageRepositoryParams) {
    const { fileName } = params
    const key = `in-memory/${fileName}`

    this.uploads.push(params)

    const item = Item.create({
      title: fileName,
      type: 'document',
      content: 'https://example.com/file.pdf',
      workspaceId: 'workspace-id',
    })

    this.items.push(item)
    return { key }
  }

  async delete(key: string): Promise<void> {
    this.items = this.items.filter((item) => `in-memory/${item.title}` !== key)
  }
}
