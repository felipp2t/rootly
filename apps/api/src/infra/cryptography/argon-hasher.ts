import { hash, verify } from 'argon2'
import type { HashComparer } from '@/domain/root/application/cryptography/hash-comparer.ts'
import type { HashGenerator } from '@/domain/root/application/cryptography/hash-generator.ts'

export class ArgonHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 8

  hash(plain: string): Promise<string> {
    return hash(plain, {
      salt: Buffer.from(
        crypto.getRandomValues(new Uint8Array(this.HASH_SALT_LENGTH)),
      ),
    })
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return verify(hash, plain)
  }
}
