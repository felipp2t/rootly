import type { RefreshTokenRepository } from '@/domain/root/application/repositories/refresh-token-repository.ts'
import type { RefreshToken } from '@/domain/root/enterprise/entities/refresh-token.ts'

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  items: RefreshToken[] = []

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.items.find((t) => t.token === token) ?? null
  }

  async create(refreshToken: RefreshToken): Promise<void> {
    this.items.push(refreshToken)
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((t) => t.id.toString() === id)
    if (index !== -1) this.items.splice(index, 1)
  }
}
