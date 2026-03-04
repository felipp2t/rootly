import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { User } from '@/domain/root/enterprise/entities/user.ts'
import type { schema } from '../schema/index.ts'

type DrizzleUser = InferSelectModel<typeof schema.users>
type DrizzleUserInsert = InferInsertModel<typeof schema.users>

export class DrizzleUserMapper {
  static toDomain(raw: DrizzleUser): User {
    return User.create(
      {
        email: raw.email,
        name: raw.name,
        passwordHash: raw.passwordHash,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? undefined,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toDrizzle(user: User): DrizzleUserInsert {
    return {
      email: user.email,
      id: user.id.toString(),
      name: user.name,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt ?? null,
    }
  }
}
