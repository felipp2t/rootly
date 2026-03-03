import type { UniqueEntityID } from "@/core/entities/unique-entity-id.ts"
import { Folder, type FolderProps } from "@/domain/root/enterprise/entities/folder.ts"
import { faker } from "@faker-js/faker/locale/pt_BR"

export function makeFolder(
  override: Partial<FolderProps> = {},
  id?: UniqueEntityID,
) {
  const folder = Folder.create(
    {
      name: faker.lorem.words(3),
      ...override,
    },
    id,
  )

  return folder
}
