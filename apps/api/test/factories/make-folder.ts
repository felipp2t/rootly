import { faker } from '@faker-js/faker/locale/pt_BR'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { WithRequired } from '@/core/types/with-required.ts'
import {
  Folder,
  type FolderProps,
} from '@/domain/root/enterprise/entities/folder.ts'

export function makeFolder(
  override: WithRequired<FolderProps, 'workspaceId'>,
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
