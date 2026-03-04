import * as folders from './folders.ts'
import * as items from './items.ts'
import * as users from './users.ts'

export const schema = {
  ...folders,
  ...items,
  ...users,
}
