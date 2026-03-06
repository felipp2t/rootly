import { eq } from 'drizzle-orm'
import type { UserRepository } from '@/domain/root/application/repositories/user-repository.ts'
import type { User } from '@/domain/root/enterprise/entities/user.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleUserMapper } from '../mappers/drizzle-user-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: string): Promise<User | null> {
    const users = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))

    if (users.length === 0) {
      return null
    }

    return DrizzleUserMapper.toDomain(users[0])
  }
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))

    if (users.length === 0) {
      return null
    }

    return DrizzleUserMapper.toDomain(users[0])
  }

  async create(user: User): Promise<void> {
    await this.db.insert(schema.users).values(DrizzleUserMapper.toDrizzle(user))
  }
}
