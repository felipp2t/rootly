import { faker } from '@faker-js/faker/locale/pt_BR'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { WithRequired } from '@/core/types/with-required.ts'
import { Tag, type TagProps } from '@/domain/root/enterprise/entities/tag.ts'

const TAG_COLORS: TagProps['color'][] = [
  'blue',
  'green',
  'orange',
  'purple',
  'red',
  'yellow',
]

export function makeTag(
  override: WithRequired<TagProps, 'workspaceId'>,
  id?: UniqueEntityID,
) {
  const name = override.name ?? faker.lorem.word()
  const slug = override.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const tag = Tag.create(
    {
      name,
      slug,
      color: faker.helpers.arrayElement(TAG_COLORS),
      ...override,
    },
    id,
  )

  return tag
}
