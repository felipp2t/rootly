export const REFRESH_TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000

import { Entity } from '@/core/entities/entity.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'

export interface RefreshTokenProps {
  token: string
  userId: string
  expiresAt: Date
  createdAt: Date
}

export class RefreshToken extends Entity<RefreshTokenProps> {
  get token() {
    return this.props.token
  }

  get userId() {
    return this.props.userId
  }

  get expiresAt() {
    return this.props.expiresAt
  }

  get createdAt() {
    return this.props.createdAt
  }

  get isExpired() {
    return new Date() > this.props.expiresAt
  }

  static create(
    props: Optional<RefreshTokenProps, 'token' | 'expiresAt' | 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new RefreshToken(
      {
        ...props,
        token: props.token ?? crypto.randomUUID(),
        expiresAt:
          props.expiresAt ?? new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
