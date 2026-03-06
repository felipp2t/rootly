import type { User } from '../../enterprise/entities/user.ts'

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>
  abstract findByEmail(email: string): Promise<User | null>
  abstract create(user: User): Promise<void>
}
