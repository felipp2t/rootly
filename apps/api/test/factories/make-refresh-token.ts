import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { RefreshToken, type RefreshTokenProps } from '@/domain/root/enterprise/entities/refresh-token.ts'

export function makeRefreshToken(
  override: Partial<RefreshTokenProps> & Pick<RefreshTokenProps, 'userId'>,
  id?: UniqueEntityID,
) {
  return RefreshToken.create(
    {
      ...override,
    },
    id,
  )
}
