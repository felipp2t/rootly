import { SignJWT } from 'jose'
import { Encrypter } from '@/domain/root/application/cryptography/encrypter.ts'
import { env } from '@/infra/env/index.ts'

export class JwtEncrypter extends Encrypter {
  private secret = new TextEncoder().encode(env.JWT_SECRET)

  async encrypt(
    payload: Record<string, unknown>,
    expiresIn = '15m',
  ): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(expiresIn)
      .sign(this.secret)
  }
}
