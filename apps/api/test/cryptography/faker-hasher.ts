import type { HashComparer } from '@/domain/root/application/cryptography/hash-comparer.ts'
import type { HashGenerator } from '@/domain/root/application/cryptography/hash-generator.ts'

export class FakeHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    return plain.concat('-hashed')
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return plain.concat('-hashed') === hash
  }
}
