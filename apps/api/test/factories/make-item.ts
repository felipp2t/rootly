import { faker } from '@faker-js/faker/locale/pt_BR'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { WithRequired } from '@/core/types/with-required.ts'
import { Item, type ItemProps } from '@/domain/root/enterprise/entities/item.ts'

export function makeItem(
  override: WithRequired<ItemProps, 'folderId'>,
  id?: UniqueEntityID,
) {
  const item = Item.create(
    {
      content: faker.lorem.paragraph(),
      title: faker.lorem.words(3),
      type: 'document',
      ...override,
    },
    id,
  )

  return item
}
