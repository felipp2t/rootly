import type { Encrypter } from '@/domain/root/application/cryptography/encrypter.ts'

export class FakeEncrypter implements Encrypter {
  async encrypt(payload: Record<string, unknown>, _expiresIn?: string): Promise<string> {
    return JSON.stringify(payload)
  }
}
