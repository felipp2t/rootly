import { InMemoryStorageRepository } from './in-memory-storage-repository.ts'

describe('InMemoryStorageRepository', () => {
  let repo: InMemoryStorageRepository

  beforeEach(() => {
    repo = new InMemoryStorageRepository()
  })

  describe('upload', () => {
    it('should return a key based on the fileName', async () => {
      const result = await repo.upload({
        fileName: 'report.pdf',
        fileType: 'application/pdf',
        body: Buffer.from('data'),
      })

      expect(result.key).toBe('in-memory/report.pdf')
    })

    it('should push to uploads array', async () => {
      await repo.upload({
        fileName: 'photo.png',
        fileType: 'image/png',
        body: Buffer.from('img'),
      })

      expect(repo.uploads).toHaveLength(1)
      expect(repo.uploads[0].fileName).toBe('photo.png')
    })

    it('should create an item for the uploaded file', async () => {
      await repo.upload({
        fileName: 'doc.txt',
        fileType: 'text/plain',
        body: Buffer.from('hello'),
      })

      expect(repo.items).toHaveLength(1)
      expect(repo.items[0].title).toBe('doc.txt')
    })
  })

  describe('delete', () => {
    it('should remove the item matching the key', async () => {
      await repo.upload({
        fileName: 'file.pdf',
        fileType: 'application/pdf',
        body: Buffer.from('content'),
      })

      await repo.delete('in-memory/file.pdf')

      expect(repo.items).toHaveLength(0)
    })

    it('should do nothing when key does not match any item', async () => {
      await repo.upload({
        fileName: 'file.pdf',
        fileType: 'application/pdf',
        body: Buffer.from('content'),
      })

      await repo.delete('in-memory/other.pdf')

      expect(repo.items).toHaveLength(1)
    })
  })
})
