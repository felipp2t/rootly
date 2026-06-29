import type { UserRepository } from '@/domain/root/application/repositories/user-repository.ts'
import type { User } from '@/domain/root/enterprise/entities/user.ts'

export class InMemoryUserRepository implements UserRepository {
  items: User[] = []

  async findById(id: string): Promise<User | null> {
    return this.items.find((user) => user.id.toString() === id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((user) => user.email === email) ?? null
  }

  async create(user: User): Promise<void> {
    this.items.push(user)
  }

  async save(user: User): Promise<void> {
    const index = this.items.findIndex(
      (u) => u.id.toString() === user.id.toString(),
    )
    if (index !== -1) this.items[index] = user
  }
}
