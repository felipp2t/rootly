import { faker } from '@faker-js/faker/locale/pt_BR'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { WithRequired } from '@/core/types/with-required.ts'
import {
  Workspace,
  type WorkspaceProps,
} from '@/domain/root/enterprise/entities/workspace.ts'

export function makeWorkspace(
  override: WithRequired<WorkspaceProps, 'userId'>,
  id?: UniqueEntityID,
) {
  const folder = Workspace.create(
    {
      name: faker.lorem.words(3),
      ...override,
    },
    id,
  )

  return folder
}
