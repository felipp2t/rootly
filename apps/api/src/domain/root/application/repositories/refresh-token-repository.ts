import type { RefreshToken } from '../../enterprise/entities/refresh-token.ts'

export abstract class RefreshTokenRepository {
  abstract findByToken(token: string): Promise<RefreshToken | null>
  abstract create(refreshToken: RefreshToken): Promise<void>
  abstract delete(id: string): Promise<void>
}
