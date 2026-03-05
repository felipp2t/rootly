import { faker } from '@faker-js/faker/locale/pt_BR'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { User, type UserProps } from '@/domain/root/enterprise/entities/user.ts'

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityID,
) {
  const user = User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash: faker.internet.password(),
      ...override,
    },
    id,
  )

  return user
}
