import type { UserRepository } from '@/domain/root/application/repositories/user-repository.ts'
import type { User } from '@/domain/root/enterprise/entities/user.ts'

export class InMemoryUserRepository implements UserRepository {
  users: User[] = []

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id.toString() === id) ?? null
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null
  }
  async save(user: User): Promise<void> {
    this.users.push(user)
  }
}
