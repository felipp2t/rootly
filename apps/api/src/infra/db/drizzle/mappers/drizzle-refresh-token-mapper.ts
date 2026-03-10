import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { RefreshToken } from '@/domain/root/enterprise/entities/refresh-token.ts'
import type { schema } from '../schema/index.ts'

type DrizzleRefreshToken = InferSelectModel<typeof schema.refreshTokens>
type DrizzleRefreshTokenInsert = InferInsertModel<typeof schema.refreshTokens>

export class DrizzleRefreshTokenMapper {
  static toDomain(raw: DrizzleRefreshToken): RefreshToken {
    return RefreshToken.create(
      {
        token: raw.token,
        userId: raw.userId,
        expiresAt: raw.expiresAt,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toDrizzle(refreshToken: RefreshToken): DrizzleRefreshTokenInsert {
    return {
      id: refreshToken.id.toString(),
      token: refreshToken.token,
      userId: refreshToken.userId,
      expiresAt: refreshToken.expiresAt,
      createdAt: refreshToken.createdAt,
    }
  }
}
