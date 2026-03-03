import type { UniqueEntityID } from "@/core/entities/unique-entity-id.ts"
import { Folder } from "@/domain/root/enterprise/entities/folder.ts"
import { Item, type ItemProps } from "@/domain/root/enterprise/entities/item.ts"
import { faker } from "@faker-js/faker/locale/pt_BR"

export function makeItem(
  override: Partial<ItemProps> = {},
  id?: UniqueEntityID,
) {
  const item = Item.create(
    {
      content: faker.lorem.paragraph(),
      folderId: override.folderId ?? Folder.create({ name: faker.lorem.words(3) }).id.toString(),
      title: faker.lorem.words(3),
      type: 'document',
      ...override,
    },
    id,
  )

  return item
}
