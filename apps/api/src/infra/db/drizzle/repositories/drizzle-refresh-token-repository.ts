import { eq } from 'drizzle-orm'
import type { RefreshTokenRepository } from '@/domain/root/application/repositories/refresh-token-repository.ts'
import type { RefreshToken } from '@/domain/root/enterprise/entities/refresh-token.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleRefreshTokenMapper } from '../mappers/drizzle-refresh-token-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findByToken(token: string): Promise<RefreshToken | null> {
    const rows = await this.db
      .select()
      .from(schema.refreshTokens)
      .where(eq(schema.refreshTokens.token, token))

    if (rows.length === 0) return null

    return DrizzleRefreshTokenMapper.toDomain(rows[0])
  }

  async create(refreshToken: RefreshToken): Promise<void> {
    await this.db
      .insert(schema.refreshTokens)
      .values(DrizzleRefreshTokenMapper.toDrizzle(refreshToken))
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(schema.refreshTokens)
      .where(eq(schema.refreshTokens.id, id))
  }
}
