import * as folders from './folders.ts'
import * as items from './items.ts'
import * as users from './users.ts'
import * as workspaces from './workspaces.ts'

export const schema = {
  ...folders,
  ...items,
  ...users,
  ...workspaces,
}
