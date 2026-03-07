import * as folderTags from './folder-tags.ts'
import * as folders from './folders.ts'
import * as itemTags from './item-tags.ts'
import * as items from './items.ts'
import * as tags from './tags.ts'
import * as users from './users.ts'
import * as workspaces from './workspaces.ts'

export const schema = {
  ...folderTags,
  ...folders,
  ...itemTags,
  ...items,
  ...tags,
  ...users,
  ...workspaces,
}
